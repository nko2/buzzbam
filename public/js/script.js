//function updateUserStatus()
//{
//  $.getJSON('getuser', function(data) {
//    if (data.user) {
//      var anchor = $('<a/>');
//      anchor.click(function(e) {
//        //$.getJSON('logout', updateUserStatus);
//        window.location = 'http://www.facebook.com/logout.php';
//      });
//      anchor.text('Logout (' + data.user.name + ')');
//      $('.loggedin').empty().append(anchor);
//    }
//    else {
//      var anchor = $('<a/>');
//      anchor.attr('href', 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login');
//      anchor.text('Login with Facebook');
//      $('.loggedin').empty().append(anchor);
//    }
//  });
//}

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

  return that;
})();

$(document).ready(function() {
  updateUserStatus();
  updateUserData();
});

