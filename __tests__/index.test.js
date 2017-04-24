import os from 'os';
import nock from 'nock';
import fs from 'mz/fs';
import path from 'path';
import rimraf from 'rimraf';

import pageLoader from '../src';

const host = 'http://localhost';

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(`${os.tmpdir()}/`);

  const files = [
    '/index.html',
    '/corrupted.html',
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
});

test('load page with assets', (done) => {
  pageLoader(`${host}/index.html`, tmpDir)
    .then(([page, assets]) =>
      Promise.all(assets.map(asset =>
        asset.load
          .then(() =>
            fs.exists(asset.file).then(resp => expect(resp).toBeTruthy()),
          ),
      ))
        .then(() => fs.exists(page).then(resp => expect(resp).toBeTruthy()))
        .then(done)
        .catch(done.fail),
    )
    .catch(done.fail);
});

test('page doesn\'t found', (done) => {
  pageLoader(`${host}/page-404`, tmpDir)
    .then(done.fail)
    .catch((err) => {
      expect(err.status).toBe(404);
      done();
    });
});

test('couldn\'t download asset', (done) => {
  pageLoader(`${host}/corrupted.html`, tmpDir)
    .then(([, assets]) =>
      Promise.all(assets.map(asset =>
        asset.load,
      ))
        .then(done.fail)
        .catch((err) => {
          expect(err.status).toBe(404);
          done();
        }),
    );
});

test('trying save to not exist directory', (done) => {
  pageLoader(`${host}/index.html`, `${tmpDir}/not_exist_folder`)
    .then(done.fail)
    .catch((err) => {
      expect(err.code).toBe('ENOENT');
      done();
    });
});

test('couldn\'t create local assets folder', (done) => {
  fs.chmodSync(tmpDir, '0555');
  pageLoader(`${host}/temp.html`, tmpDir)
    .then(done.fail)
    .catch((err) => {
      expect(err.code).toBe('EACCES');
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
