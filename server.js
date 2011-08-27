
/**
 * Module dependencies.
 */

require('nko')('SVvsNwr4CEZy0EzQ');

var express = require('express');
var https = require('https');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var config = require('./config');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret:"foo"}));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

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
  });
  request.write(content);
  request.end();
}

function map(input, fn) {
  var result = [];
  for (var index in input) {
    var item = input[index];
    result.push(fn(item));
  }
  return result;
}

function getUuid(fn) {
  var options = {
    host:'buzzbam.iriscouch.com',
    port:443,
    path:'/_uuids',
  };
  jsonGet(options, function(result) {
    fn(result.uuids[0]);
  });
}

app.get('/user', function(req, res) {
  var id = req.param('id');
  jsonGet({host: 'graph.facebook.com', port: 443, path: '/'+id+'?access_token=' + req.session.user.access_token}, function(result) {
    res.send(result);
  });
});

app.get('/friends', function(req, res) {
  if (!req.session.user) {
    res.send(JSON.stringify({me:{name:'Anonymous'},friends:[]});
  }
  else {
    jsonGet({host: 'graph.facebook.com', port: 443, path: '/me/friends?access_token=' + req.session.user.access_token}, function(result) {
      var response = {
        me: { 
          id: req.session.user.id,
          name: req.session.user.name,
        },
        friends: result.data
      };
      res.send(JSON.stringify(response));
    });
  }
});

app.get('/newparty', function(req, res) {
  var title = req.param('title');
  var description = req.param('description');

  var party = {
    title: title,
    description: description,
    public: false,
    users: [{
      id: req.session.user.id,
      role: "admin",
      rsvp: "yes"
    }],
    items: [],
    when: {},
    where: {}
  };

  getUuid(function(uuid){
    var options = {
      host:'buzzbam.iriscouch.com',
      port:443,
      path:'/party/'+uuid,
      method:'PUT'
    };
    jsonPost(options, JSON.stringify(party), function(result) {
      res.send(result);
    });
  });

});

app.get('/party', function(req, res) {
  var id = req.param('id');
  var options = {
    host:'buzzbam.iriscouch.com',
    port:443,
    path:'/party/'+id
  };
  jsonGet(options, function(party) {
    res.send(JSON.stringify(party));
  });
});

function viewValues(viewResult) {
  var results = [];
  var rows = viewResult.rows;
  for (var row in rows) {
    results.push(rows[row].value);
  }
  return results;
}

app.get('/parties', function(req, res) {
  var id = req.session.user ? req.session.user.id : '';
  jsonGet({host:'buzzbam.iriscouch.com',port:443,path:'/party/_design/parties/_view/public'}, function(publicParties) {
    var options = {
      host:'buzzbam.iriscouch.com',
      port:443,
      path:'/party/_design/parties/_view/parties?key="'+id+'"'
    };
    jsonGet(options, function(parties) {
      var result = {
        'public': viewValues(publicParties),
        'parties': viewValues(parties)
      };
      res.send(JSON.stringify(result));
    });
  });
});

app.get('/getuser', function(req, res) {
  var response = {};
  if (req.session.user) {
    response.user = req.session.user;
  }
  res.send(JSON.stringify(response));
});

app.get('/logout', function(req, res) {
  var request = http.request({
    host: 'www.facebook.com',
    port: 80,
    path: '/logout.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function (result) {
    console.log(result);
    result.on('data', function(chunk){
      console.log('logout: ' + chunk);
    });
    delete req.session.user;
    res.send('{}', 200);
  });
  request.write('confirm=1');
  request.end();
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
  console.log({cody:code});

  https.get({
    host: 'graph.facebook.com',
    port: 443,
    path: '/oauth/access_token?client_id='+config.fb.key+'&redirect_uri=http://partyplanner.no.de/login&client_secret='+config.fb.secret+'&code='+code
  }, function(result) {
    var body = '';
    result.on('data', function (chunk) {
      body += chunk;
    });
    result.on('end', function() {
      if (result.statusCode != 200) {
        res.send(body, 500);
        return;
      }
      var parsed = qs.parse(body);
      console.log(parsed);
      req.session.user = {
        access_token: parsed.access_token
      };
      jsonGet({host: 'graph.facebook.com', port: 443, path: '/me?access_token=' + req.session.user.access_token}, function(result) {
        req.session.user.name = result.name;
        req.session.user.id = result.id;
        res.redirect('/index.html');
      });
    });
  });
  
});

app.get('/*', function(req, res){
  res.redirect('/index.html');
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
