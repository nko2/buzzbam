function updateUserData() {
  server.getUserAndFriends(function(data) {
    viewModel.isLoggedIn(data.me.id ? true : false);
    viewModel.user(new user({ fullName: data.me.name }));
    viewModel.friends(data.me.friends);
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

  that.newComment = function(itemid, message, callback) {
    $.post('newcomment', {id:itemid, message:message}, callback, 'json');
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

  that.getParties = function(callback) {
    $.getJSON('parties', callback);
  };

  that.getItems = function(partyid, callback) {
    $.getJSON('parties', {id:partyid}, callback);
  };

  return that;
})();

$(document).ready(function() {
  getUserAndFriends();
});

