import url from 'url';
import path from 'path';
import fs from 'mz/fs';
import debug from 'debug';

import httpClient from './lib/httpClient';
import { getLocalAssets, replaceAssetsPath } from './lib/domNode';

const log = debug('page-loader');

const generateNameByPath = (pageUrl) => {
  const { host, path: urlPath } = url.parse(pageUrl);
  const urlPathName = path.join(host, urlPath);
  return urlPathName.replace(/[^a-zA-Z]/g, '-');
};

const generateNewName = (name) => {
  if (name[0] === '/') {
    return name.slice(1).replace(/\//g, '-');
  }
  return name.replace(/\//g, '-');
};

const getSite = (pageUrl) => {
  const { protocol, host } = url.parse(pageUrl);
  return `${protocol}//${host}`;
};

const createAssetsFolder = (folder) => {
  log('create asset folder', folder);
  return fs.exists(folder)
    .then((isExist) => {
      if (!isExist) {
        return fs.mkdir(folder);
      }
      return isExist;
    });
};

const createAssetsMap = (html, pageUrl, saveFolder) => {
  const siteUrl = getSite(pageUrl);
  const assets = getLocalAssets(html);
  return assets.reduce((acc, file) => ({
    ...acc,
    [file]: {
      urlPath: url.resolve(siteUrl, file),
      savePath: path.resolve(saveFolder, generateNewName(file)),
    },
  }), {});
};

const downloadAssets = (assetsMap, task) =>
  Promise.all(Object.keys(assetsMap).map((file) => {
    const { urlPath, savePath } = assetsMap[file];
    const downloader = httpClient({
      method: 'get',
      url: urlPath,
      responseType: 'stream',
    })
      .then(response =>
        new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(savePath);
          stream.on('error', reject);
          stream.on('finish', () => {
            log(`downloaded asset from ${urlPath} to ${savePath}`);
            resolve(savePath);
          });
          response.data.pipe(stream);
        }),
      );

    if (task) {
      return task(downloader, savePath);
    }

    return downloader
      .catch(err =>
        Promise.reject(new Error(`${err.message} with asset on url ${urlPath}`)),
      );
  }));

export default (pageUrl, outputFolder = './', task) => {
  const htmlFileName = `${generateNameByPath(pageUrl)}.html`;
  const assetsFolderName = `${generateNameByPath(pageUrl)}_files`;
  const htmlFilePath = path.resolve(outputFolder, htmlFileName);
  const assetsFolderPath = path.resolve(outputFolder, assetsFolderName);

  return httpClient.get(pageUrl)
    .catch(err =>
      Promise.reject(new Error(`${err.message} with url ${pageUrl}`)),
    )
    .then(response =>
      createAssetsFolder(assetsFolderPath)
        .then(() => response.data),
    )
    .then((data) => {
      log(`save page to ${htmlFilePath}`);
      const assetsMap = createAssetsMap(data, pageUrl, assetsFolderPath);
      const replacedData = replaceAssetsPath(data, assetsMap);
      return fs.writeFile(htmlFilePath, replacedData, 'utf8').then(() => assetsMap);
    })
    .then(assetsMap =>
      downloadAssets(assetsMap, task).then(downloadedAssests =>
        [htmlFilePath, ...downloadedAssests],
      ),
    );
};
