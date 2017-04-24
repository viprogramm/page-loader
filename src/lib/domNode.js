import cheerio from 'cheerio';
import path from 'path';

export const getLocalAssets = (data) => {
  const $ = cheerio.load(data);

  const getSrc = (i, el) => $(el).attr('src');
  const getHref = (i, el) => $(el).attr('href');

  const typesTable = {
    'img[src]': getSrc,
    'script[src]': getSrc,
    'link[href]': getHref,
  };

  return Object.keys(typesTable).reduce((acc, key) =>
    [
      ...acc,
      ...$(key).map(typesTable[key]),
    ], []);
};

export const replaceAssetsPath = (data, folder, generateName = () => {}) => {
  const $ = cheerio.load(data);

  const updateSrc = (i, el) => {
    const src = $(el).attr('src');
    $(el).attr('src', path.join(folder, generateName(src)));
  };

  const updateHref = (i, el) => {
    const href = $(el).attr('href');
    $(el).attr('href', path.join(folder, generateName(href)));
  };

  const typesTable = {
    'img[src]': updateSrc,
    'script[src]': updateSrc,
    'link[href]': updateHref,
  };

  Object.keys(typesTable).forEach(key =>
    $(key).each(typesTable[key]),
  );

  return $.html();
};
