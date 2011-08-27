
/**
 * Module dependencies.
 */

var consumer_key = '225589484159909';
var consumer_secret = 'a9d292055b206ac346dd4010ddc8abed';

require('nko')('SVvsNwr4CEZy0EzQ');

var express = require('express');
var https = require('https');
var url = require('url');
var qs = require('querystring');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret:"foo"}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

function jsonGet(options, callback) {
  https.get(options, function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      callback(JSON.parse(body));
    });
  });
}


app.get('/summary', function(req, res) {
  jsonGet({host: 'graph.facebook.com', port: 443, path: '/me?access_token=' + req.session.user.access_token}, function(result) {
    res.send(JSON.stringify(result));
  });
});

app.get('/login', function(req, res) {

  var error = req.param('error');
  if (error) {
    // XXX TODO
    console.log(error);
    res.send(500);
    return;
  }

  var code = req.param('code');

  https.get({
    host: 'graph.facebook.com',
    port: 443,
    path: '/oauth/access_token?client_id='+consumer_key+'&client_secret='+consumer_secret+'&code='+code
  }, function(res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function() {
      if (res.statusCode != 200) {
        res.send(body, 500);
        return;
      }
      var parsed = qs.parse(body);
      req.session.user = {
        access_token: parsed.access_token
      };
      res.redirect('/summary');
    });
  });
  
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
