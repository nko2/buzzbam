var parties = [];
var friends = [];

var partyInfo = function (opt) {
  this.id = opt.id;
  this.isPublic = opt.isPublic;
  this.title = opt.title;
  this.description = opt.description;
  this.users = ko.observableArray();//[new user(opt.creator)]);
  this.userIds = ko.observableArray(opt.userIds);
  this.items = ko.observableArray([]);
  this.whereInfo = new whereInfo(opt.whereInfo);
  this.whenInfo = new whenInfo(opt.whenInfo);
};

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
}
  
var viewModel = {
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
  friends: ko.observableArray(friends),
  parties: ko.observableArray(parties),
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = user().fullName;
    return "Logout (" + name + ")";
  } else {
    return "Log into Facebook";
  }
}, viewModel);

viewModel.logInOutOfFacebook = ko.dependentObservable(function() {
  if (viewModel.isLoggedIn()) {
    window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
  } else {
    window.location = 'http://www.facebook.com/logout.php';
  }
}, viewModel);

ko.applyBindings(viewModel);

function populateParty(party) {
  var userIds = party.userIds;
  for (var i in party.userIds) {
    $.getJSON('user?id=' + userIds[i], function(data) {
      party.users.push(new user({ }));
    });
  }
}

function populateParties() {
  $(document).ready(function() {
    $.getJSON('parties', function(data) {
      var newParties = [];
      for (var i in data) {
        newParties.push(new partyInfo({
          id: data[i].id,
          isPublic: data[i].public,
          title: data[i].title,
          description: data[i].description,
          userIds: data[i].users,
          itemIds: data[i].items,
          whereId: data[i].whereId,
          whenId: data[i].whenId,
        }));
      }
      viewModel.parties(newParties);
    });
  });
}

$(document).ready(function() {
  populateParties();
});
