

/*
var user = function (opt) {
  var that = this;
  that.id = opt.id;
  that.userId = opt.userId;
  that.firstName = opt.firstName;
  that.lastName = opt.lastName;
  that.fullName = opt.fullName;
  that.link = opt.link;
  that.email = opt.email;
  that.role = opt.role ? opt.role : 'contrib';
  that.rsvp = opt.rsvp ? opt.rsvp : 'maybe';
  that.timezone = opt.timezone;
  that.locale = opt.locale;
};

var friend = function (opt) {
  var that = this;
  that.userId = opt.userId;
  that.fullName = opt.fullName;
  that.inParty = ko.observable(false);
  that.remove = function () { viewModel.friends.remove(that); }
}
*/

var itemInfo = function (id) {
  var that = this;
  that.id = id;
  that.task = ko.observable(true);
  that.done = ko.observable(false);
  that.description = ko.observable('');
  that.comments = ko.observableArray([]);
};

var partyInfo = function () {
  var that = this;
  that.isPublic = ko.observable(false);
  that.title = ko.observable('');
  that.description = ko.observable('');
  that.users = ko.observableArray([]);
  that.items = ko.observableArray([]);
  that.todos = ko.dependentObservable(function() {
    var newTodos = [];
    var curItems = that.items();
    for (var i in curItems) {
      if (curItems[i].isTodo()) {
        newTodos.push(curItems[i]);
      }
    }
    return newTodos;
  });
  that.where = ko.observable('');
  that.when = ko.observable('');
  that.formattedDateTimeFull = ko.dependentObservable(function () {
      return "";
    }, that);
};
  
var viewModel = {
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
  friends: ko.observableArray([]),
  selectedParty: ko.observable(new partyInfo({})),
  items: ko.observableArray([]),
  chats: ko.observableArray([]),
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = viewModel.user().name;
    return "Logout, " + name;
  } else {
    return "Log in";
  }
}, viewModel);

viewModel.formattedLocation = ko.dependentObservable(function () {
  if (viewModel.selectedParty() &&
      viewModel.selectedParty().whereInfo) {
      return whereInfo.location;
  }
}, viewModel);

viewModel.formattedTimeFull = ko.dependentObservable(function () {
  if (viewModel.selectedParty() &&
      viewModel.selectedParty().whenInfo) {
    
  }
}, viewModel);

viewModel.whereClick = whereClick;
viewModel.whenClick = whenClick;
viewModel.whoClick = whoClick;
viewModel.whereChange = whereChange;
viewModel.whenChange = whenChange;
viewModel.whoChange = whoChange;
viewModel.selectedPartyUsers = function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().users;
  }
  return [];
};
viewModel.selectedPartyTodos = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().todos();
  }
  return [];
});
viewModel.selectedPartyItems = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().items();
  }
  return [];
});
viewModel.selectedPartyDescription = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().description();
  }
  return "";
});
viewModel.selectedPartyTitle = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().title();
  }
  return "";
});
viewModel.selectedPartyUsers = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().users();
  }
  return "";
});
viewModel.unselectedFriends = ko.dependentObservable(function () {
  if (viewModel.selectedParty()) {
    var unselectedFriends = [];
    var hash = [];
    var selectedUsers = viewModel.selectedParty().users();
    // populate hash
    for (var i in selectedUsers) {
      hash[selectedUsers[i].userId] = true;
    }
    var friends = viewModel.friends();
    // compare hash
    for (var i in friends) {
      if (!hash[friends[i].userId]) {
        unselectedFriends.push(friends[i]);
        // XXX TODO
        //friends[i].inParty(true);
      } else {
        //friends[i].inParty(false);
      }
    }
    return unselectedFriends;
  }
  return [];
});
viewModel.addFriend = function(userId) {
  var selectedParty = viewModel.selectedParty();
  if (selectedParty) {
    // find friend
    var friends = viewModel.friends();
    for (var i in friends) {
      if (friends[i].userId == userId) {
        friends[i].inParty(true);
        var partyUsers = selectedParty.users();
        // make sure it's not already in the list
        for (var j in partyUsers) {
          if (partyUsers[j].userId == userId) {
            return;
          }
        }
        selectedParty.users.push(new user({
          userId: friends[i].userId,
          fullName: friends[i].fullName,
        }));
        break;
      }
    }
  }
};
viewModel.removeFriend = function(userId) {
  var selectedParty = viewModel.selectedParty();
  if (selectedParty) {
    // remove from party
    var removed = selectedParty.users.remove(function(item) {
        return item.userId == userId;
      });
    if (removed.length > 0) {
      var friends = viewModel.friends();
      for (var i in friends) {
        if (friends[i].userId == userId) {
          friends[i].inParty(false);
        }
      }
    }
  }
};
viewModel.redirectToParty = function(partyId) {
  window.location = 'http://partyplanner.no.de/party.html?partyId=' + partyId;
};
viewModel.addComment = function(item, message) {
  if (item && item.id && message && message.length > 0) {
    server.newComment(item.id, message);
  }
};

viewModel.logInOutOfFacebook = function() {
  if (!model.isLoggedIn) {
    window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
  } else {
    FB.logout(function(resp) {
      modelSetUser({});
    });
  }
};


window.plannerViewModel = viewModel;

$(document).ready(function() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  var uri = parseUri(window.location.search);
  if (uri && uri.queryKey && uri.queryKey.partyId) {
    server.getParty(uri.queryKey.partyId, function(data) {
      modelSetParty(data);
    });
  }
  
  ko.applyBindings(viewModel);
  updateUserData();
});


