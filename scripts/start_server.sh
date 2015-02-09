#!/bin/sh

#run server
export PORT = 80
forever start ../server/app.js -v
