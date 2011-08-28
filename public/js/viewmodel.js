var parties = [];
var publicParties = [];
var friends = [];

var whereInfo = function (opt) {
  var that = this;
  that.id = opt.id;
  that.location = ko.observable(opt.location);
};

var whenInfo = function (opt) {
  var that = this;
  that.id = opt.id;
  that.startTime = ko.observable(opt.startTime);
  that.endTime = ko.observable(opt.endTime);
  
  that.formattedTimeDateFull = ko.dependentObservable(function () {
    if (that.startTime && that.endTime) {
      return that.startTime + ' ' + that.endTime;
    } else if (that.startTime) {
      return that.startTime;
    }
    else return '';
  });
};

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
	that.remove = function () { viewModel.friends.remove(that); }
}

var item = function (opt) {
  var that = this;
  that.id = opt._id;
  that.isTodo = ko.observable(opt.task);
  that.isDone = ko.observable(opt.done);
  that.description = ko.observable(opt.description);
  that.comments = ko.observableArray(opt.comments ? opt.comments : []);
};

var comment = function (opt) {
  var that = this;
  that.id = opt._id;
  that.itemId = opt.itemid;
  that.userId = opt.user;
  that.userName = opt.name;
  that.text = opt.message;
  that.time = opt.time ? opt.time : Date.now();
};

var partyInfo = function (opt) {
  var that = this;
  that.id = opt.id;
  that.isPublic = opt.isPublic;
  that.title = ko.observable(opt.title);
  that.description = ko.observable(opt.description);
  that.users = ko.observableArray([]);//[new user(opt.creator)]);
  that.userIds = ko.observableArray(opt.userIds);
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
  that.whereInfo = new whereInfo(opt.where ? opt.where : {});
  that.whenInfo = new whenInfo(opt.when ? opt.when : {});
  that.formattedLocation = ko.dependentObservable(function () {
      return that.whereInfo.location;
    }, that);
  that.formattedDateTimeFull = ko.dependentObservable(function () {
      return "";
    }, that);
};
  
var viewModel = {
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
  friends: ko.observableArray(friends),
  parties: ko.observableArray(parties),
  publicParties: ko.observableArray(publicParties),
  selectedParty: ko.observable(new partyInfo({})),
  whereVisible: ko.observable(false),
  whenVisible: ko.observable(false),
  whereVisible: ko.observable(false),
  chats: ko.observableArray([]),
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = viewModel.user().fullName;
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

viewModel.logInOutOfFacebook = logInOutOfFacebook;
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
viewModel.redirectToParty = function(partyId) {
  window.location = 'http://partyplanner.no.de/index.html?partyId=' + partyId;
};
viewModel.addComment = function(item, message) {
  if (item) {
    server.newComment(item.id, message, function(data) {
      var comment = parseComment(data);
      comment.itemId = item.id;
      comment.userId = viewModel.user().id;
      item.comments.push(comment);
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
      var newParty = parseParty(data);
      // select the new party by default
      viewModel.selectedParty(newParty);
    });
  }
  
  ko.applyBindings(viewModel);
  updateUserData();
});
