import url from 'url';
import path from 'path';
import fs from 'mz/fs';
import axios from 'axios';

const getFileName = (page) => {
  const protocol = url.parse(page).protocol;
  const urlPathName = page.slice((`${protocol}//`).length);
  return `${urlPathName.replace(/[^a-zA-Z]/g, '-')}.html`;
};

export default (pageUrl, outputFolder = './') => {
  const fileName = getFileName(pageUrl);
  const filePath = path.resolve(outputFolder, fileName);

  return new Promise((resolve, reject) => {
    axios.get(pageUrl)
      .then((response) => {
        fs.writeFile(filePath, response.data, 'utf8')
          .then(() => {
            resolve(filePath);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
