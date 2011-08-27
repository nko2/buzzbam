 
/**
 * Module dependencies.
 */

var consumer_key = '225589484159909';
var consumer_secret = 'a9d292055b206ac346dd4010ddc8abed';

require('nko')('SVvsNwr4CEZy0EzQ');

var express = require('express');
//var OAuth = require('oauth').OAuth;

var app = module.exports = express.createServer();

//var oauth = new OAuth(
//  "https://www.facebook.com/dialog/oauth",
//  "https://graph.facebook.com/oauth/access_token",
//  consumer_key, consumer_secret, "1.0",
//  "http://192.168.1.216:3000/done", "HMAC-SHA1");

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

app.get('/login', function(req, res) {

  var error = req.param('error');
  if (error) {
    // XXX TODO
    console.log(error);
    res.send(500);
    return;
  }

  var code = req.param('code');
  req.session.user = {
    code: code
  };
  res.redirect('/');
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
