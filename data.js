

var config = require('./config');
var client = require('./client');
var qs = require('querystring');

var parties = {};
var items = {};
var comments = {};

function load(path, seq, callback) {
  var params = {};
  if (seq) {
    params.since = seq,
    params.feed = 'longpoll'
  }
  couchGet(path+'/_changes', params, function(initial) {
    for (var index in initial.results) {
      var id = initial.results[index].id;
      couchGet(path + '/' + id, callback);
    }
    load(path, initial.last_seq, callback);
  });
}

load('/party', undefined, function(party) {
  parties[party._id] = party;
});

load('/items', undefined, function(item) {
  items[item._id] = item;
});

load('/chat', undefined, function(comment) {
  comments[comment._id] = comment;
});

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

function getItems(session, partyid, callback) {
  getParty(session, partyid, function(party) {
    if (party.error) {
      callback({error:"permission denied"});
    }
    else {
      var results = [];
      for (var id in items) {
        var item = items[id];
        if (item.partyid === partyid) {
	  results.push(item._id);
	}
      }
      callback(results);
    }
  });
} 

function getParties(session, callback) {
  var userid = session.user ? session.user.id : '';
  var results = [];
  for (var id in parties) {
    var party = parties[id];
    if (partyHasUser(party, session.user)) { 
      results.push(party._id);
    }
  }
  callback(results);
} 

function getComments(session, partyid, callback) {
  getParty(session, partyid, function(party) {
    if (party.error) {
      callback({error:"permission denied"});
    }
    else {
      var results = [];
      for (var id in comments) {
        var comment = comments[id];
        if (comment.partyid === partyid) {
	  results.push(comment._id);
	}
      }
      callback(results);
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
  var party = parties[partyid];
  if (party && partyHasUser(party, session.user)) {
    callback(party);
  }
  else {
    callback({error:"permission denied"});
  }
}

function getComment(session, chatid, callback) {
  var comment = comments[chatid];
  getParty(session, comment.partyid, function(party) {
    if (!comment || party.error) {
      callback({error:"permission denied"});
    }
    else {
      callback(comment);
    }
  });
}

function getItem(session, itemid, callback) {
  var item = items[itemid];
  getParty(session, item.partyid, function(party) {
    if (!item || party.error) {
      callback({error:"permission denied"});
    }
    else {
      callback(item);
    }
  });
}

function longPollParties(session, userid, since, callback) {
  if (!since) {
    couchGet('/party', function(db) {
      if (db.error) {
        callback(db);
      }
      else {
        longPollParties(session, userid, db.committed_update_seq, callback);
      }
    });
  }
  else {
    var params = {
      filter: 'parties/mydoc',
      userid: userid,
      since: since,
      feed: 'longpoll'
    };
    couchGet('/party/_changes', params, callback);
  }
}

function longPollComments(session, partyid, since, callback) {
  if (!since) {
    couchGet('/chat', function(db) {
      if (db.error) {
        callback(db);
      }
      else {
        longPollComments(session, partyid, db.committed_update_seq, callback);
      }
    });
  }
  else {
    var params = {
      filter: 'comments/myparty',
      partyid: partyid,
      since: since,
      feed: 'longpoll'
    };
    couchGet('/chat/_changes', params, callback);
  }
}

function longPollItems(session, partyid, since, callback) {
  if (!since) {
    couchGet('/items', function(db) {
      if (db.error) {
        callback(db);
      }
      else {
        longPollItems(session, partyid, db.committed_update_seq, callback);
      }
    });
  }
  else {
    var params = {
      filter: 'parties/myparty',
      partyid: partyid,
      since: since,
      feed: 'longpoll'
    };
    couchGet('/items/_changes', params, callback);
  }
}

exports.longPollParties = longPollParties;
exports.longPollItems = longPollItems;
exports.longPollComments = longPollComments;
exports.getParty = getParty;
exports.getParties = getParties;
exports.getItem = getItem;
exports.getComment = getComment;
exports.getComments = getComments;
exports.getItems = getItems;
exports.couchGet = couchGet;
exports.couchPost = couchPost;


