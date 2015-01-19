#!/bin/sh
sudo yum update
sudo yum install git
sudo yum install nodejs npm --enablerepo=epel

sudo npm install

sudo npm install -g bower
bower install