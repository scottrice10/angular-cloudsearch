#!/usr/bin/env bash
cd /tmp

rm -rf angular-cloudsearch; true

git clone https://github.com/scottrice10/angular-cloudsearch.git

cd angular-cloudsearch

npm install
npm start