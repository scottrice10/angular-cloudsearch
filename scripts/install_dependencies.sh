#!/bin/sh
yum install nodejs npm --enablerepo=epel

npm install
npm install -g bower

bower install