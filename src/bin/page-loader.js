#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../';

program
  .version('0.0.1')
  .description('Load page to folder.')
  .option('--output [folder path]', 'Output folder')
  .arguments('<page_url>')
  .action((pageUrl, options) => {
    pageLoader(pageUrl, options.output)
      .then((filePath) => {
        console.log(`File was saved to ${filePath}`);
      })
      .catch((error) => {
        console.error(error.toString());
      });
  })
  .parse(process.argv);
