import url from 'url';
import path from 'path';
import fs from 'mz/fs';
import getHttpClient from './lib/httpClient';

const getFileName = (page) => {
  const { host, path: urlPath } = url.parse(page);
  const urlPathName = path.join(host, urlPath);
  return `${urlPathName.replace(/[^a-zA-Z]/g, '-')}.html`;
};

export default (pageUrl, outputFolder = './', http = getHttpClient()) => {
  const fileName = getFileName(pageUrl);
  const filePath = path.resolve(outputFolder, fileName);

  return http.get(pageUrl)
    .then((response) => {
      fs.writeFileSync(filePath, response.data, 'utf8');
      return filePath;
    });
};
