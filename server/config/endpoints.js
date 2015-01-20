var AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + "/config.json");

//AWS cloudsearchdomain configuration
exports.cloudsearchdomain = new AWS.CloudSearchDomain({
  endpoint: 'https://search-imorgo-axx2j6p35ftfdsmbwrupypvdy4.us-west-2.cloudsearch.amazonaws.com',
  apiVersion: '2013-01-01'
});

exports.domain = "imorgo-search";
