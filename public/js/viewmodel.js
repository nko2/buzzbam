var parties = [];
var publicParties = [];
var friends = [];

var whereInfo = function (opt) {
  this.id = opt.id;
  this.location = ko.observable(opt.location);
};

var whenInfo = function (opt) {
  this.id = opt.id;
  this.startTime = ko.observable(opt.startTime);
  this.endTime = ko.observable(opt.endTime);
  
  this.formattedTimeDateFull = ko.dependentObservable(function () {
    if (this.startTime && this.endTime) {
      return this.startTime + ' ' + this.endTime;
    } else if (this.startTime) {
      return this.startTime;
    }
    else return '';
  });
};

var user = function (opt) {
  this.id = opt.id;
  this.userId = opt.userId;
  this.firstName = opt.firstName;
  this.lastName = opt.lastName;
  this.fullName = opt.fullName;
  this.link = opt.link;
  this.email = opt.email;
  this.role = opt.role ? opt.role : 'contrib';
  this.rsvp = opt.rsvp ? opt.rsvp : 'maybe';
  this.timezone = opt.timezone;
  this.locale = opt.locale;
};

var friend = function (opt) {
	this.userId = opt.userId;
	this.fullName = opt.fullName;
	
	this.remove = function () { viewModel.friends.remove(this); }
}

var item = function (opt) {
  this.id = opt.id;
  this.isTodo = ko.observable(opt.isTodo);
  this.isDone = ko.observable(opt.isDone);
  this.description = opt.description;
  this.comments = ko.observableArray(opt.comments ? opt.comments : []);
};

var comment = function (opt) {
  this.id = opt.id;
  this.userId = opt.userId;
  this.text = opt.text;
  this.time = opt.time ? opt.time : Date.now();
  
  this.getUserInfo = function (callback) {
    server.getUserInfo(this.userId, callback);
  }
};

var partyInfo = function (opt) {
  this.id = opt.id;
  this.isPublic = opt.isPublic;
  this.title = opt.title;
  this.description = opt.description;
  this.users = ko.observableArray([]);//[new user(opt.creator)]);
  this.userIds = ko.observableArray(opt.userIds);
  this.items = ko.observableArray([]);
  this.todos = ko.dependentObservable(function() {
    var newTodos = [];
    var curItems = this.items();
    for (var i in curItems) {
      if (curItems[i].isTodo()) {
        newTodos.push(curItems[i]);
      }
    }
    return newTodos;
  });
  this.whereInfo = new whereInfo(opt.where ? opt.where : {});
  this.whenInfo = new whenInfo(opt.when ? opt.when : {});
};
  
var viewModel = {
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
  friends: ko.observableArray(friends),
  parties: ko.observableArray(parties),
  publicParties: ko.observableArray(publicParties),
  selectedParty: ko.observable(),
  whereVisible: ko.observable(false),
  whenVisible: ko.observable(false),
  whereVisible: ko.observable(false),
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = viewModel.user().fullName;
    return "Logout (" + name + ")";
  } else {
    return "Log into Facebook";
  }
}, viewModel);

viewModel.formattedLocation = ko.dependentObservable(function () {
  if (viewModel.selectedParty() &&
      viewModel.selectedParty().whereInfo) {
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
viewModel.selectedPartyUsers = function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().users;
  }
  return [];
}
viewModel.selectedPartyTodos = function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().todos;
  }
  return [];
}
viewModel.selectedPartyItems = function () {
  if (viewModel.selectedParty()) {
    return viewModel.selectedParty().items;
  }
  return [];
}

$(document).ready(function() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  ko.applyBindings(viewModel);
  updateUserData();
});
