// MODEL
var model = {
  parties: [],
  user: undefined,
  isLoggedIn: false,
};

function modelSetParties(parties) {
  model.parties = parties;
  viewModel.parties(parties);
};

function modelSetUser(user) {
  model.user = user;
  viewModel.user(user);
};

function modelSetIsLoggedIn(isLoggedIn) {
  model.isLoggedIn = isLoggedIn;
  viewModel.isLoggedIn(isLoggedIn);
};

// VIEWMODEL
var viewModel = {
  parties: ko.observableArray([]),
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
};

viewModel.logInOutOfFacebook = function() {
  if (!viewModel.isLoggedIn()) {
    window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
  } else {
    FB.logout(function(resp) {
      viewModel.user(new user({}));
      viewModel.isLoggedIn(false);
    });
  }
};

viewModel.createNewParty = function() {
  // get information from form
  var title = "default title";
  var description = "default description";
  server.newParty(title, description, function(data) {
      var newParty = parseParty(data);
      window.location = 'index.html?partyId=' + newParty.id;
    });
};

viewModel.getPublicParties = ko.dependentObservable(function() {
  var parties = viewModel.parties();
  var publicParties = [];
  for (var i in parties) {
    if (parties[i].isPublic) {
      publicParties.push(parties[i]);
    }
  };
  return publicParties;
});

viewModel.getPrivateParties = ko.dependentObservable(function() {
  var parties = viewModel.parties();
  var privateParties = [];
  for (var i in parties) {
    if (!parties[i].isPublic) {
      privateParties.push(parties[i]);
    }
  };
  return privateParties;
});

viewModel.redirectToParty = function(partyId) {
  window.location = 'http://partyplanner.no.de/index.html?partyId=' + partyId;
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (viewModel.user() && viewModel.isLoggedIn()) {
    var name = viewModel.user().fullName;
    return "Logout, " + name;
  } else {
    return "Log in";
  }
}, viewModel);

// FUNCTIONS
function loadData() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  server.getUserAndFriends(function(data) {
      modelSetUser(data.me);
      model.isLoggedIn(data.me.id ? true : false);
    });
  server.getParties(function(parties) {
      modelSetParties(parties);
    });
};


// READY
$(document).ready(function() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  
  ko.applyBindings(viewModel);
  loadData();
});