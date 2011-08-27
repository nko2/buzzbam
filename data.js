

var config = require('./config');
var client = require('./client');

function partyHasUser(party, user) {
  for (var userIndex in party.users) {
    var user = party.users[userIndex];
    if (session.user.id == user.id) {
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

exports.getParty = getParty;
exports.getItem = getItem;
exports.getItems = getItems;

