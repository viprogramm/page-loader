import os from 'os';
import nock from 'nock';
import fs from 'mz/fs';
import path from 'path';
import rimraf from 'rimraf';

import getHttpClient from '../src/lib/httpClient';
import pageLoader from '../src';

const http = getHttpClient('http');
const tmpDir = fs.mkdtempSync(`${os.tmpdir()}/`);
const host = 'http://localhost';

beforeEach(() => {
  const files = [
    '/index.html',
    '/corrupted-index.html',
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

  nock(host)
    .get('/temp.html')
    .reply(200, 'Hello world');

  nock(host)
    .get('/page-404')
    .reply(404, 'Not Found');

  nock(host)
    .get('/assets/not-exist-main.js')
    .reply(404, 'Not Found');
});

test('page was created', (done) => {
  pageLoader(`${host}/index.html`, tmpDir, http)
    .then((file) => {
      expect(fs.existsSync(file)).toBeTruthy();
      done();
    })
    .catch(done.fail);
});

test('page doesn\'t found', (done) => {
  pageLoader(`${host}/page-404`, tmpDir, http)
    .catch((err) => {
      expect(err.message).toBe('Request failed with status code 404 with url http://localhost/page-404');
      done();
    });
});

test('couldn\'t download asset', (done) => {
  pageLoader(`${host}/corrupted-index.html`, tmpDir, http)
    .catch((err) => {
      expect(err.message).toBe('Request failed with status code 404 with asset on url http://localhost/assets/not-exist-main.js');
      done();
    });
});

test('trying save to not exist directory', (done) => {
  pageLoader(`${host}/index.html`, `${tmpDir}/not_exist_folder`, http)
    .catch((err) => {
      expect(err.message).toBe(`ENOENT: no such file or directory, mkdir '${tmpDir}/not_exist_folder/localhost-index-html_files'`);
      done();
    });
});

test('couldn\'t create local assets folder', (done) => {
  fs.chmodSync(tmpDir, '0555');
  pageLoader(`${host}/temp.html`, tmpDir, http)
    .catch((err) => {
      expect(err.message).toBe(`EACCES: permission denied, mkdir '${tmpDir}/localhost-temp-html_files'`);
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
