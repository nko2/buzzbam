var parties = [];

var partyInfo = function (opt) {
	this.id = opt.id;
	this.isPublic = opt.isPublic;
	this.title = opt.title;
	this.description = opt.description;
	this.users = ko.observableArray([new user(opt.creator)]);
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
	userFullName: ko.observable();
	parties: ko.observableArray(parties);
};

ko.applyBindings(viewModel);

function populateParties()
{
  $(document).ready(function() {
    $.getJSON('parties', function(data) {
			parties.clear();
			for (var i in data) {
				parties.add(new partyInfo({
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
    });
  });
}

$(document).ready(function() {
  populateParties();
});