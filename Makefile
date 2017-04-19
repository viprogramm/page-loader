install:
	npm install

start:
	npm run babel-node -- ./src/bin/page-loader.js --output /var/tmp https://en.hexlet.io/courses

publish: test lint
	npm publish

build:
	rm -rf dist
	npm run build

lint:
	npm run eslint -- src

test:
	npm test