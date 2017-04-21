import cheerio from 'cheerio';

export const getLocalAssets = (data) => {
  const $ = cheerio.load(data);

  const imgs = $('img[src]').map((i, el) =>
    $(el).attr('src'),
  );
  const scripts = $('script[src]').map((i, el) =>
    $(el).attr('src'),
  );
  const links = $('link[href]').map((i, el) =>
    $(el).attr('href'),
  );

  return [...imgs, ...scripts, ...links]
    .filter(item => !(item.includes('http://') || item.includes('https://')));
};

export const replaceAssetsPath = (data, assetsMap) => {
  const $ = cheerio.load(data);

  $('img[src], script[src]').each((i, el) => {
    const src = $(el).attr('src');

    if (assetsMap[src]) {
      $(el).attr('src', assetsMap[src].savePath);
    }
  });

  $('link[href]').each((i, el) => {
    const href = $(el).attr('href');

    if (assetsMap[href]) {
      $(el).attr('href', assetsMap[href].savePath);
    }
  });

  return $.html();
};
