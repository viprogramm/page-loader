import cheerio from 'cheerio';

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
    ], []).filter(item => !(item.includes('http://') || item.includes('https://')));
};

export const replaceAssetsPath = (data, assetsMap) => {
  const $ = cheerio.load(data);

  const updateSrc = (i, el) => {
    const src = $(el).attr('src');

    if (assetsMap[src]) {
      $(el).attr('src', assetsMap[src].savePath);
    }
  };

  const updateHref = (i, el) => {
    const href = $(el).attr('href');

    if (assetsMap[href]) {
      $(el).attr('href', assetsMap[href].savePath);
    }
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
