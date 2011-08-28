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
  var sinceChats;

  // returns {first_name,last_name,name,id, ... }
  that.getUserInfo = function(id, callback) {
    console.log('getUserInfo');
    $.getJSON('user', {id:id}, callback);
  };

  // returns {me:{id?,name},friends:[{id,name}*]}
  that.getUserAndFriends = function(callback) {
    console.log('getUserAndFriends');
    $.getJSON('friends', callback);
  };

  that.newItem = function(partyid, description, callback) {
    console.log('newItem');
    $.post('newitem', {id:partyid,description:description}, callback, 'json');
  };

  that.newChat = function(partyid, message, callback) {
    console.log('newChat');
    $.post('newchat', {partyid:partyid, message:message}, callback, 'json');
  };

  that.newComment = function(itemid, message, callback) {
    console.log('newComment');
    $.post('newcomment', {itemid:itemid, message:message}, callback, 'json');
  };

  that.newParty = function(title, description, callback) {
    console.log('newParty');
    var data = { title: title };
    if (description) {
      data.description = description;
    }
    $.getJSON('newparty', data, callback);
  };

  that.getParty = function(id, callback) {
    console.log('getParty');
    $.getJSON('party', {id:id}, callback);
  };

  that.updateParty = function(id, party, callback) {
    console.log('updateParty');
    $.post('updateparty', {party:party}, callback, 'json');
  };

  that.getParties = function(since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    console.log('getParties');
    $.getJSON('parties', {since:since}, callback);
  };

  that.getPublicParties = function(callback) {
    console.log('getPublicParties');
    $.getJSON('parties', {public:true}, callback);
  };

  that.getItems = function(partyid, since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    console.log('getItems');
    $.getJSON('parties', {partyid:partyid,since:since}, callback);
  };

  that.getItem = function(itemid, callback) {
    console.log('getItem');
    $.getJSON('item', {itemid:itemid}, callback);
  };

  that.getComments = function(partyid, since, callback) {
    console.log('getComments');
    $.getJSON('comments', {partyid:partyid,since:since}, callback);
  };

  that.getComment = function(commentid, callback) {
    console.log({getComment:commentid});
    $.getJSON('comment', {commentid:commentid}, callback);
  };

  return that;
})();

var server_local = (function() {
  var that = {};

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
      _id:id,
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
    callback({parties:['12313452355234532','234523452353242345'],
              public:['3245234532243553242345','2345532432452354']});
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


