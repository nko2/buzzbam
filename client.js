
var https = require('https');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var config = require('./config');

function jsonGet(options, callback) {
  console.log({get: options});
  var request = https.get(options, function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      console.log({getResponse: body});
      callback(JSON.parse(body));
    });
    response.on('close', function(err) {
      console.log({close:err});
    });
  });
  request.end();
}

function jsonPost(options, content, callback) {
  console.log({post: content});
  options.headers = {
    'Content-Length': content.length,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  var request = https.request(options, function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      console.log({postResponse: body});
      callback(JSON.parse(body));
    });
    response.on('close', function(err) {
      console.log({close:err});
    });
  });
  request.write(content);
  request.end();
}

exports.get = jsonGet;
exports.post = jsonPost;

