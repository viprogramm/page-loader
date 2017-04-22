import os from 'os';
import nock from 'nock';
import fs from 'mz/fs';
import path from 'path';

import getHttpClient from '../src/lib/httpClient';
import pageLoader from '../src';

const http = getHttpClient('http');
const tmpDir = os.tmpdir();
const host = 'http://localhost';

beforeEach(() => {
  const files = [
    '/index.html',
    '/assets/image.png',
    '/assets/main.js',
    '/assets/main.css',
  ];

  files.forEach((file) => {
    const filePath = fs.readFileSync(path.join(`${__dirname}/fixtures`, file));
    nock(host)
      .get(file)
      .reply(200, filePath);
  });
});

test('that file was created', (done) => {
  pageLoader(`${host}/index.html`, tmpDir, http)
    .then((file) => {
      expect(fs.existsSync(file)).toBeTruthy();
      done();
    })
  .catch(done.fail);
});

test('that page doesn\'t exist', (done) => {
  pageLoader(`${host}/not-exist-test-page`, tmpDir, http)
    .then(done.fail)
    .catch(() => {
      done();
    });
});
