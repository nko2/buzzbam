

var config = require('./config');
var client = require('./client');
var qs = require('querystring');

var data = {};

var parties = {};
var items = {};
var comments = {};

var countdown = 0;

var pendingActions = [];

function countdownFn(n) {
  return function(x) {
    n(x);
    countdown--;
    if (countdown <= 0) {
      for (var index in pendingActions) {
        pendingActions[index]();
      }
    }
  };
}

function makeUpdater(storage, id, seq)
{
  return function(doc) {
    storage[id] = {
      seq: seq,
      doc: doc
    };
  };
}

function shortcutComment(uuid, comment)
{
  comment._id = uuid;
  comments[uuid] = { seq: -1, doc: comment };
}

function load(path, seq, storage) {
  var params = {};
  if (seq) {
    params.since = seq,
    params.feed = 'longpoll'
  }
  couchGet(path+'/_changes', params, function(initial) {
    for (var index in initial.results) {
      var change = initial.results[index];

      var fn = function(x) { return x; };
      if (seq == undefined) {
        countdown++;
        fn = countdownFn;
      } 
      couchGet(path + '/' + change.id, fn(makeUpdater(storage, change.id, change.seq)));
    }
    load(path, initial.last_seq, storage);
  });
}

function pend(action) {
  if (countdown == 0) {
    action();
  }
  else {
    pendingActions.push(action);
  }
}

load('/party', undefined, parties);
load('/items', undefined, items);
load('/chat', undefined, comments);

// call as couchGet(path, callback)
//   or as couchGet(path, params, callback)
function couchGet(path, params, callback) {
  if (!callback) {
    callback = params;
    params = undefined;
  }
  var querystring = qs.stringify(params)
  if (querystring.length > 0) {
    querystring = '?' + querystring;
  }
  var options = {
    host: config.couch.server,
    port: 443,
    path: path + querystring,
    headers: {
      Host: config.couch.server
    }
  };
  if (config.couch.basicauth) {
    options.headers.Authorization = "Basic " + config.couch.basicauth;
  }
  client.get(options, callback);
}

function couchPost(path, body, callback) {
  var options = {
    host: config.couch.server,
    port: 443,
    path: path,
    method: 'PUT',
    headers: {
      Host: config.couch.server
    }
  };
  if (config.couch.basicauth) {
    options.headers.Authorization = "Basic " + config.couch.basicauth;
  }
  client.post(options, JSON.stringify(body), callback);
}

function partyHasUser(party, user) {
  var id = user ? user.id : undefined;
  if (party.public) {
    return true;
  }
  for (var userIndex in party.users) {
    var partyUser = party.users[userIndex];
    if (partyUser.id == id) {
      return true;
    }
  }
  return false;
}

function getItems(session, partyid, since, callback) {
  if (!since) {
    since = 0;
  }
  getParty(session, partyid, function(party) {
    if (party.error) {
      callback({error:"permission denied"});
    }
    else {
      var results = [];
      var last_seq = since;
      for (var id in items) {
        var item = items[id];
        if (item.seq > last_seq && item.doc.partyid === partyid) {
          results.push(id);
          last_seq = Math.max(last_seq, item.seq);
        }
      }
      callback({last_seq:last_seq,items:results});
    }
  });
} 

function getParties(session, since, callback) {
  if (!since) {
    since = 0;
  }
  pend(function(){
    var userid = session.user ? session.user.id : '';
    var results = [];
    var last_seq = since;
    for (var id in parties) {
      var party = parties[id];
      if (party.seq > last_seq && partyHasUser(party.doc, session.user)) { 
        results.push(id);
        last_seq = Math.max(last_seq, party.seq);
      }
    }
    callback({last_seq:last_seq,parties:results});
  });
} 

function getComments(session, partyid, since, callback) {
  if (!since) {
    since = 0;
  }
  getParty(session, partyid, function(party) {
    if (party.error) {
      callback({error:"permission denied"});
    }
    else {
      var results = [];
      var last_seq = since;
      for (var id in comments) {
        var comment = comments[id];
        if ((comment.seq < 0 || comment.seq > last_seq) && comment.doc.partyid === partyid) {
          results.push(id);
          last_seq = Math.max(last_seq, comment.seq);
        }
      }
      callback({last_seq:last_seq,comments:results});
    }
  });
} 

function updateParty(session, party, callback) {
  var path = '/party/'+party.id;
  couchGet(path, function(origParty) {
    if (partyHasUser(origParty, session.user)) {
      couchPost(path, party, callback);
    }
    else {
      callback({error:"permission denied"});
    }
  });
}

function getParty(session, partyid, callback) {
  pend(function(){
    var party = parties[partyid];
    if (party && partyHasUser(party.doc, session.user)) {
      callback(party.doc);
    }
    else {
      callback({error:"permission denied"});
    }
  });
}

function getComment(session, chatid, callback) {
  pend(function(){
    var comment = comments[chatid];
    if (!comment) {
      callback({error:"permission denied"});
    }
    else {
      getParty(session, comment.doc.partyid, function(party) {
        if (party.error) {
          callback({error:"permission denied"});
        }
        else {
          callback(comment.doc);
        }
      });
    }
  });
}

function getItem(session, itemid, callback) {
  pend(function(){
    var item = items[itemid];
    if (!item) {
      callback({error:"permission denied"});
    }
    else {
      getParty(session, item.doc.partyid, function(party) {
        if (party.error) {
          callback({error:"permission denied"});
        }
        else {
          callback(item.doc);
        }
      });
    }
  });
}

exports.getParty = getParty;
exports.getParties = getParties;
exports.getItem = getItem;
exports.getComment = getComment;
exports.getComments = getComments;
exports.getItems = getItems;
exports.couchGet = couchGet;
exports.couchPost = couchPost;
exports.shortcutComment = shortcutComment;


