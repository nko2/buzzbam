
var config = require('./config');
var client = require('./client');
var cache = [];
var pending = [];

function get(callback) {
  if (cache.length > 0) {
    callback(cache.pop());
    return;
  }

  pending.push(callback);

  if (pending.length == 1) {
    // first one.. kick off reload
    var options = {
      host: config.couch.server,
      port: 443,
      path: '/_uuids?count=100'
    };
    client.get(options, function(result) {
      cache = result.uuids;
      var retry = pending;
      pending = [];
      for (var index in retry) {
        get(retry[index]);
      }
    });
  }
};

exports.get = get;
