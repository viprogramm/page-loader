import os from 'os';
import nock from 'nock';
import fs from 'mz/fs';

import getHttpClient from '../src/lib/httpClient';
import pageLoader from '../src';

const http = getHttpClient('http');
const tmpDir = os.tmpdir();
const host = 'http://localhost';

beforeEach(() => {
  const text = fs.readFileSync(`${__dirname}/fixtures/index.html`, 'utf8');

  nock(host)
    .get('/test')
    .reply(200, text);
});

test('that file was created', (done) => {
  pageLoader(`${host}/test`, tmpDir, http)
    .then((file) => {
      expect(fs.existsSync(file)).toBeTruthy();
      done();
    })
    .catch(done.fail);
});

test('that page doesn\'t exist', (done) => {
  pageLoader(`${host}/not-exist-test-page`, tmpDir, http)
    .catch(() => {
      done();
    })
    .then(done.fail);
});
