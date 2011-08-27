

var config = require('./config');
var client = require('./client');

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
      var options = {
	host: config.couch.server,
	port: 443,
	path: '/items/_design/parties/_view/items?key="'+partyid+'"'
      };
      client.get(options, callback);
    }
  });
}

function updateParty(session, party, callback) {
  var options = {
    host: config.couch.server,
    port: 443,
    path: '/party/'+party.id
  };
  client.get(options, function(origParty) {
    if (partyHasUser(origParty, session.user)) {
      options.method = 'PUT';
      client.post(options, JSON.stringify(party), function(result) {
        callback(result);
      });
    }
    else {
      callback({error:"permission denied"});
    }
  });
}

function getParty(session, partyid, callback) {
  var options = {
    host: config.couch.server,
    port: 443,
    path: '/party/'+partyid
  };
  client.get(options, function(party) {
    if (partyHasUser(party, session.user)) {
      callback(party);
    }
    else {
      callback({error:"permission denied"});
    }
  });
}

function getItem(session, itemid, callback) {
  var options = {
    host: config.couch.server,
    port: 443,
    path: '/items/'+itemid
  };
  client.get(options, function(item) {
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
    var options = {
      host: config.couch.server,
      port: 443,
      path: '/party'
    };
    client.get(options, function(db) {
      if (db.error) {
        callback(db);
      }
      else {
        longPollParties(session, userid, db.committed_update_seq, callback);
      }
    });
  }
  else {
    var options = {
      host: config.couch.server,
      port: 443,
      path: '/party/_changes?filters=parties/mydoc&userid='+userid+'&since='+since+'&feed=longpoll'
    };
    client.get(options, function(changes) {
      callback(changes);
    });
  }
}

function longPollItems(session, partyid, since, callback) {
  if (!since) {
    var options = {
      host: config.couch.server,
      port: 443,
      path: '/items'
    };
    client.get(options, function(db) {
      if (db.error) {
        callback(db);
      }
      else {
        longPollItems(session, partyid, db.committed_update_seq, callback);
      }
    });
  }
  else {
    var options = {
      host: config.couch.server,
      port: 443,
      path: '/items/_changes?filters=parties/myparty&partyid='+partyid+'&since='+since+'&feed=longpoll'
    };
    client.get(options, function(changes) {
      callback(changes);
    });
  }
}

exports.longPollParties = longPollParties;
exports.longPollItems = longPollItems;
exports.getParty = getParty;
exports.getItem = getItem;
exports.getItems = getItems;

