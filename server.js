
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
var uuid = require('./uuid');
var client = require('./client');
var data = require('./data');

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

function map(input, fn) {
  var result = [];
  for (var index in input) {
    var item = input[index];
    result.push(fn(item));
  }
  return result;
}

// Routes

app.get('/longpoll/items', function(req, res) {
  var partyid = req.param('partyid');
  var since = req.param('since');
  data.getParty(req.session, partyid, function(party) {
    if (party.error) {
      res.send(403);
    }
    else {
      data.longPollItems(req.session, partyid, since, function(changes) {
	var result = {
	  last_seq: changes.last_seq,
	  items: map(changes.results, function(x) { return x.id; })
	};
	res.send(result);
      });
    }
  });
});

app.get('/longpoll/parties', function(req, res) {
  var userid = req.session.user.id;
  var since = req.param('since');
  data.longPollParties(req.session, userid, since, function(changes) {
    var result = {
      last_seq: changes.last_seq,
      parties: map(changes.results, function(x) { return x.id; })
    };
    res.send(result);
  });
});

app.get('/user', function(req, res) {
  var id = req.param('id');
  client.get({host: 'graph.facebook.com', port: 443, path: '/'+id+'?access_token=' + req.session.user.access_token}, function(result) {
    res.send(result);
  });
});

app.get('/friends', function(req, res) {
  if (!req.session.user) {
    res.send(JSON.stringify({me:{name:'Anonymous'},friends:[]}));
  }
  else {
    client.get({host: 'graph.facebook.com', port: 443, path: '/me/friends?access_token=' + req.session.user.access_token}, function(result) {
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

app.post('/updateparty', function(req,res) {
  var party = req.param('party');
  data.updateParty(req.seession, party, function(result) {
    if (result.error) {
      res.send(403);
    }
    else {
      res.send(result);
    }
  });
});

app.post('/newitem', function(req, res) {
  var partyid = req.param('id');
  var description = req.param('description');

  data.getParty(req.session, partyid, function(party) {
    if (party.error) {
      res.send(403);
    }
    else {
      var item = {
        task: true,
        done: false,
        partyid: partyid,
        description: description,
      };

      uuid.get(function(uuid){
        var options = {
          host:'buzzbam.iriscouch.com',
          port:443,
          path:'/items/'+uuid,
          method:'PUT'
        };
        client.post(options, JSON.stringify(item), function(result) {
          res.send(result);
        });
      });
    }
  });
});

app.post('/newcomment', function(req, res) {
  var itemid = req.param('id');
  var message = req.param('message');

  data.getItem(req.session, itemid, function(item) {
    if (item.error) {
      res.send(403);
    }
    else {
      if (!(item.comments instanceof Array)) {
        item.comments = [];
      }
      item.comments.push({
        user: req.session.user.id,
        message: message,
        time: new Date()
      });
      var updated = JSON.stringify(item);
      var options = {
        host: config.couch.server,
        port: 443,
        path: '/items/'+itemid,
        method: 'PUT'
      };
      client.post(options, updated, function(result) {
        res.send(JSON.stringify(result));
      });
    }
  });

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
    when: {},
    where: {}
  };

  uuid.get(function(uuid){
    var options = {
      host:'buzzbam.iriscouch.com',
      port:443,
      path:'/party/'+uuid,
      method:'PUT'
    };
    client.post(options, JSON.stringify(party), function(result) {
      res.send(result);
    });
  });

});

app.get('/party', function(req, res) {
  var id = req.param('id');
  data.getParty(req.session, id, function(party) {
    if (party.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(party));
    }
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

app.get('/items', function(req, res) {
  var id = req.param('id');
  data.getItems(req.session, id, function(items) {
    if (items.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(viewValues(items)));
    }
  });
});

app.get('/parties', function(req, res) {
  var id = req.session.user ? req.session.user.id : '';
  client.get({host:'buzzbam.iriscouch.com',port:443,path:'/party/_design/parties/_view/public'}, function(publicParties) {
    var options = {
      host:'buzzbam.iriscouch.com',
      port:443,
      path:'/party/_design/parties/_view/parties?key="'+id+'"'
    };
    client.get(options, function(parties) {
      var result = {
        'public': viewValues(publicParties),
        'parties': viewValues(parties)
      };
      res.send(JSON.stringify(result));
    });
  });
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
      client.get({host: 'graph.facebook.com', port: 443, path: '/me?access_token=' + req.session.user.access_token}, function(result) {
        req.session.user.name = result.name;
        req.session.user.id = result.id;
        res.redirect('/index.html');
      });
    });
  });
  
});

app.get('/*', function(req, res){
  res.send(404);
  //res.redirect('/index.html');
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
