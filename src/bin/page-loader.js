#!/usr/bin/env node

import program from 'commander';
import Listr from 'listr';
import pageLoader from '../';

const listrTask = asset =>
  new Listr([
    {
      title: `Download asset ${asset.url}`,
      task: (ctx, task) =>
        asset.load
          .then((response) => {
            ctx.response = response;
          })
          .catch(err => task.skip(`Skip: ${err.message}`)),
    },
  ]).run().then(ctx => ctx.response);

program
  .version('0.0.1')
  .description('Load page to folder.')
  .option('--output [folder path]', 'Output folder')
  .arguments('<page_url>')
  .action((pageUrl, options) => {
    pageLoader(pageUrl, options.output)
      .then(([page, assets]) =>
        Promise.all(assets.map(asset =>
          listrTask(asset),
        ))
          .then(() => console.log(`Page was saved to ${page}`)),
      )
      .catch((err) => {
        console.error(err.message);
        process.exitCode = 1;
      });
  })
  .parse(process.argv);
