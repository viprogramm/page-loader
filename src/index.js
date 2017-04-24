import url from 'url';
import path from 'path';
import fs from 'mz/fs';
import debug from 'debug';

import httpClient from './lib/httpClient';
import { getLocalAssets, replaceAssetsPath } from './lib/domNode';

const debugCommon = debug('page-loader:common');
const debugLoad = debug('page-loader:load');
const debugSave = debug('page-loader:save');
const debugError = debug('page-loader:error');

const generateNameByPath = (pageUrl) => {
  const { host, path: urlPath } = url.parse(pageUrl);
  const urlPathName = path.join(host, urlPath);
  return urlPathName.replace(/[^a-zA-Z]/g, '-');
};

const generateName = name =>
  name.replace(/\//g, '-');

const getSite = (pageUrl) => {
  const { protocol, host } = url.parse(pageUrl);
  return `${protocol}//${host}`;
};

const createAssetsMap = (html, pageUrl, saveFolder) => {
  const siteUrl = getSite(pageUrl);
  const assets = getLocalAssets(html);
  return assets.reduce((acc, file) => ({
    ...acc,
    [file]: {
      urlPath: url.resolve(siteUrl, file),
      savePath: path.resolve(saveFolder, generateName(file)),
    },
  }), {});
};

const downloadAssets = assetsMap =>
  Object.keys(assetsMap).map((file) => {
    const { urlPath, savePath } = assetsMap[file];
    const load = httpClient({
      method: 'get',
      url: urlPath,
      responseType: 'stream',
    })
      .then((response) => {
        debugLoad(urlPath);
        response.data.pipe(fs.createWriteStream(savePath));
      })
      .then((data) => {
        debugSave(savePath);
        return data;
      })
      .catch((err) => {
        debugError(`couldn't save ${savePath} file`);
        return Promise.reject(err);
      });
    return { url: urlPath, file: savePath, load };
  });

export default (pageUrl, outputFolder = './') => {
  const htmlFileName = `${generateNameByPath(pageUrl)}.html`;
  const assetsFolderName = `${generateNameByPath(pageUrl)}_files`;
  const htmlFilePath = path.resolve(outputFolder, htmlFileName);
  const assetsFolderPath = path.resolve(outputFolder, assetsFolderName);

  return fs.mkdir(assetsFolderPath)
    .then(() => debugCommon(`asset folder ${assetsFolderPath} was created`))
    .then(() => httpClient.get(pageUrl))
    .then((response) => {
      const { data } = response;
      const replacedData = replaceAssetsPath(data, assetsFolderName, generateName);
      return fs.writeFile(htmlFilePath, replacedData, 'utf8')
        .then(() => {
          debugCommon(`page was saved to ${htmlFilePath}`);
          return data;
        });
    })
    .then((data) => {
      const assetsMap = createAssetsMap(data, pageUrl, assetsFolderPath);
      return [htmlFilePath, downloadAssets(assetsMap)];
    });
};
