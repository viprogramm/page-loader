#!/usr/bin/env node

import program from 'commander';
import Listr from 'listr';
import pageLoader from '../';

const listrTask = (downloader, file) =>
  new Listr([
    {
      title: `Download asset to ${file}`,
      task: (ctx, task) =>
        downloader
          .then((response) => {
            ctx.resp = response;
          })
          .catch(err => task.skip(`Skip: ${err.message}`)),
    },
  ]).run().then(ctx => ctx.resp);

program
  .version('0.0.1')
  .description('Load page to folder.')
  .option('--output [folder path]', 'Output folder')
  .arguments('<page_url>')
  .action((pageUrl, options) => {
    new Listr([
      {
        title: 'Download page',
        task: (ctx, task) =>
          pageLoader(pageUrl, options.output, listrTask)
            .then((links) => {
              const t = task;
              const page = links[0];
              t.title = `Page was saved to ${page}`;
            })
            .catch((err) => {
              console.error(err.message);
              process.exitCode = 1;
            }),
      },
    ]).run();
  })
  .parse(process.argv);
