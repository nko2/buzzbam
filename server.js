
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
  data.updateParty(req.session, party, function(result) {
    if (result.error) {
      res.send(403);
    }
    else {
      res.send(result);
    }
  });
});

app.get('/uuids', function(req, res) {
  var options = {
    host: config.couch.server,
    port: 443,
    path: '/_uuids?count=100'
  };
  client.get(options, function(result) {
    res.send(JSON.stringify(result.uuids));
  });
});

app.post('/newitem', function(req, res) {
  var uuid = req.param('uuid');
  var item = JSON.parse(req.param('item'));

  data.getParty(req.session, item.partyid, function(party) {
    if (party.error) {
      res.send(403);
    }
    else {
      data.couchPost('/items/'+uuid, item, function(result) {
	res.send(result);
      });
    }
  });
});

app.post('/newcomment', function(req, res) {
  var uuid = req.param('uuid');
  var comment = JSON.parse(req.param('comment'));

  data.getParty(req.session, comment.partyid, function(party) {
    if (comment.error) {
      res.send(403);
    }
    else {
      data.shortcutComment(uuid, comment);
      data.couchPost('/chat/'+uuid, comment, function(result) {
        res.send(result);
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
    when: 'When',
    where: 'Where'
  };

  uuid.get(function(uuid){
    data.couchPost('/party/'+uuid, party, function(result) {
      if (result.ok) {
        data.couchGet('/party/'+uuid, function(result) {
          res.send(result);
        });
      }
      else {
        res.send(result);
      }
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

app.get('/comment', function(req, res) {
  var commentid = req.param('commentid');
  data.getComment(req.session, commentid, function(comment) {
    if (comment.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(comment));
    }
  });
});

app.get('/comments', function(req, res) {
  var partyid = req.param('partyid');
  var since = req.param('since');
  data.getComments(req.session, partyid, since, function(items) {
    if (items.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(items));
    }
  });
});

app.get('/item', function(req, res) {
  var itemid = req.param('itemid');
  data.getItem(req.session, itemid, function(item) {
    if (item.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(item));
    }
  });
});

app.get('/items', function(req, res) {
  var partyid = req.param('partyid');
  var since = req.param('since');
  data.getItems(req.session, partyid, since, function(items) {
    if (items.error) {
      res.send(403);
    }
    else {
      res.send(JSON.stringify(items));
    }
  });
});

app.get('/parties', function(req, res) {
  var id = req.session.user ? req.session.user.id : '';
  var since = req.param('since');
  data.getParties(req.session, since, function(parties) {
    res.send(JSON.stringify(parties));
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
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
