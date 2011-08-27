var parties = [];
var friends = [];

var whereInfo = function (opt) {
  this.id = opt.id;
  this.location = opt.location;
};

var whenInfo = function (opt) {
  this.id = opt.id;
  this.startTime = opt.startTime;
  this.endTime = opt.endTime;
};

var user = function (opt) {
  this.id = opt.id;
  this.userId = opt.userId;
  this.fullName = opt.fullName;
  this.email = opt.email;
  this.role = opt.role ? opt.role : 'contrib';
  this.rsvp = opt.rsvp ? opt.rsvp : 'maybe';
};

var friend = function (opt) {
	this.userId = opt.userId;
	this.name = opt.name;
	
	this.remove = function () { viewModel.friends.remove(this); }
}

var item = function (opt) {
  this.id = opt.id;
  this.isTask = opt.isTask;
  this.isDone = opt.isDone;
  this.description = opt.description;
  this.comments = ko.observableArray(opt.comments ? opt.comments : []);
};

var comment = function (opt) {
  this.id = opt.id;
  this.userId = opt.userId;
  this.text = opt.text;
  this.time = opt.time ? opt.time : Date.now();
};

var partyInfo = function (opt) {
  this.id = opt.id;
  this.isPublic = opt.isPublic;
  this.title = opt.title;
  this.description = opt.description;
  this.users = ko.observableArray();//[new user(opt.creator)]);
  this.userIds = ko.observableArray(opt.userIds);
  this.items = ko.observableArray([]);
  this.whereInfo = new whereInfo(opt.where);
  this.whenInfo = new whenInfo(opt.when);
};

var viewModel = {
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
  friends: ko.observableArray(friends),
  parties: ko.observableArray(parties),
  selectedParty: ko.observable(),
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = viewModel.user().fullName;
    return "Logout (" + name + ")";
  } else {
    return "Log into Facebook";
  }
}, viewModel);

viewModel.logInOutOfFacebook = logInOutOfFacebook;

ko.applyBindings(viewModel);