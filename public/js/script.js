function updateUserData() {
  server.getUserAndFriends(function(data) {
    viewModel.isLoggedIn(data.me.id ? true : false);
    viewModel.user(new user({ fullName: data.me.name }));
    populateFriends(data.friends);
    server.getParties(populateParties);
    if (data.me.id) {
      server.getUserInfo(data.me.id, populateUserInfo);
    }
  });
}

function log(x) {
  console.log(x);
}

var server = (function() {
  var that = {};

  // these should be undefined to start
  var sinceParties;
  var sinceItems;

  // returns [partyid,partyid,...]
  that.longPollPartyChanges = function(callback) {
    $.getJSON('longpoll/parties', {since:sinceParties}, function(changes) {
      sinceParties = changes.last_seq;
      callback(changes.parties);
    });
  };

  // returns [itemid,itemid,...]
  that.longPollItemChanges = function(partyid, callback) {
    $.getJSON('longpoll/items', {partyid:partyid, since:sinceItems}, function(changes) {
      sinceItems = changes.last_seq;
      callback(changes.items);
    });
  };

  // returns [commentid,commentid,...]
  that.longPollItemChanges = function(partyid, callback) {
    $.getJSON('longpoll/comments', {partyid:partyid, since:sinceItems}, function(changes) {
      sinceItems = changes.last_seq;
      callback(changes.comments);
    });
  };

  // returns {first_name,last_name,name,id, ... }
  that.getUserInfo = function(id, callback) {
    $.getJSON('user', {id:id}, callback);
  };

  // returns {me:{id?,name},friends:[{id,name}*]}
  that.getUserAndFriends = function(callback) {
    $.getJSON('friends', callback);
  };

  that.newItem = function(partyid, description, callback) {
    $.post('newitem', {id:partyid,description:description}, callback, 'json');
  };

  that.newChat = function(partyid, message, callback) {
    $.post('newchat', {partyid:partyid, message:message}, callback, 'json');
  };

  that.newComment = function(itemid, message, callback) {
    $.post('newcomment', {itemid:itemid, message:message}, callback, 'json');
  };

  that.newParty = function(title, description, callback) {
    var data = { title: title };
    if (description) {
      data.description = description;
    }
    $.getJSON('newparty', data, callback);
  };

  that.getParty = function(id, callback) {
    $.getJSON('party', {id:id}, callback);
  };

  that.updateParty = function(id, party, callback) {
    $.post('updateparty', {party:party}, callback, 'json');
  };

  that.getParties = function(callback) {
    $.getJSON('parties', callback);
  };

  that.getPublicParties = function(callback) {
    $.getJSON('parties', {public:true}, callback);
  };

  that.getItems = function(partyid, callback) {
    $.getJSON('parties', {partyid:partyid}, callback);
  };

  that.getItem = function(itemid, callback) {
    $.getJSON('item', {itemid:itemid}, callback);
  };

  that.getComments = function(partyid, callback) {
    $.getJSON('comments', {partyid:partyid}, callback);
  };

  that.getComment = function(comment, callback) {
    $.getJSON('comment', {comment:comment}, callback);
  };

  return that;
})();

var server_local = (function() {
  var that = {};

  // returns [partyid,partyid,...]
  that.longPollPartyChanges = function(callback) {
      callback([]);
  };

  // returns [itemid,itemid,...]
  that.longPollItemChanges = function(partyid, callback) {
  };

  // returns {first_name,last_name,name,id, ... }
  that.getUserInfo = function(id, callback) {
    callback({id:id,name:'Anonymous'});
  };

  // returns {me:{id?,name},friends:[{id,name}*]}
  that.getUserAndFriends = function(callback) {
    callback({me:{name:'Anoymous'},friends:[]});
  };

  that.newItem = function(partyid, description, callback) {
    callback({});
  };

  that.newComment = function(itemid, message, callback) {
    callback({});
  };

  that.newParty = function(title, description, callback) {
    callback({});
  };

  that.getParty = function(id, callback) {
    callback({
      id:id,
      title:'Title',
      description:'Description',
      users:[],
      where:{},
      when:{}
    });
  };

  that.updateParty = function(id, party, callback) {
    callback({});
  };

  that.getParties = function(callback) {
    callback({parties:['12313452355234532','234523452353242345']});
  };

  that.getPublicParties = function(callback) {
    callback([]);
  };

  that.getItems = function(partyid, callback) {
    callback([]);
  };

  that.getItem = function(itemid, callback) {
    callback({});
  };

  that.getComments = function(partyid, callback) {
    callback([]);
  };

  that.getComment = function(commentid, callback) {
    callback({});
  };

  return that;
})();


