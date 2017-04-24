install:
	npm install

start:
	rm -rf /var/tmp/*
	npm run babel-node -- ./src/bin/page-loader.js --output /var/tmp https://en.hexlet.io/courses

debug:
	rm -rf /var/tmp/*
	DEBUG="page-loader:*" npm run babel-node -- ./src/bin/page-loader.js --output /var/tmp https://en.hexlet.io/courses

link:
	npm link

publish: test lint
	npm publish

build:
	rm -rf dist
	npm run build

lint:
	npm run eslint

test:
	npm test