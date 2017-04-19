import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import fs from 'mz/fs';
import rimraf from 'rimraf';

import pageLoader from '../src';

const host = 'http://localhost';
axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const tmpDir = fs.mkdtempSync('/tmp/pageloader');
const text = fs.readFileSync(`${__dirname}/fixtures/index.html`, 'utf8');

beforeEach(() => {
  nock(host)
    .get('/test')
    .reply(200, text);
});

test('that file was created', (done) => {
  pageLoader(`${host}/test`, tmpDir)
    .then((file) => {
      expect(fs.existsSync(file)).toBeTruthy();
      done();
    });
});

test('that page doesn\'t exist', (done) => {
  pageLoader(`${host}/not-exist-test-page`, tmpDir)
    .catch(() => {
      done();
    });
});

afterAll(() => {
  rimraf(tmpDir, (error) => {
    if (error) {
      throw error;
    }
  });
});
