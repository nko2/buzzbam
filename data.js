

var config = require('./config');
var client = require('./client');
var qs = require('querystring');

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
    headers.Authorization = "Basic " + config.count.basicauth;
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
    headers.Authorization = "Basic " + config.count.basicauth;
  }
  client.post(options, JSON.stringify(body), callback);
}

function partyHasUser(party, user) {
  for (var userIndex in party.users) {
    var partyUser = party.users[userIndex];
    if (partyUser.id == user.id) {
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
      couchGet('/items/_design/parties/_view/items', {key:partyid}, callback);
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
  couchGet('/party/'+partyid, function(party) {
    if (partyHasUser(party, session.user)) {
      callback(party);
    }
    else {
      callback({error:"permission denied"});
    }
  });
}

function getItem(session, itemid, callback) {
  client.get('/items/'+itemid, function(item) {
    getParty(session, item.partyid, function(party) {
      if (party.error) {
        callback({error:"permission denied"});
      }
      else {
        callback(item);
      }
    });
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
      filters: 'parties/mydoc',
      userid: userid,
      since: since,
      feed: 'longpoll'
    };
    couchGet('/party/_changes', params, callback);
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
      filters: 'parties/myparty',
      partyid: partyid,
      since: since,
      feed: 'longpoll'
    };
    couchGet('/items/_changes', params, callback);
  }
}

exports.longPollParties = longPollParties;
exports.longPollItems = longPollItems;
exports.getParty = getParty;
exports.getItem = getItem;
exports.getItems = getItems;
exports.couchGet = couchGet;
exports.couchPost = couchPost;


