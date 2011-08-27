function logIntoFacebook() {
  window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
}

function updateUserData()
{
  $.getJSON('friends', function(data) {
    viewModel.isLoggedIn(data.me.id?true:false);
    viewModel.user(new user({fullName: data.me.name});
    viewModel.friends(data.me.friends);
  });
}

function log(x) {
  console.log(x);
}

var server = (function(){
  var that = {};

  that.getUser = function(id, callback) {
    $.getJSON('user', {id:id}, callback);
  };

  that.getFriends = function(callback) {
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
  updateUserData();
});

