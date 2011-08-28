
function populateParties(result) {
  if (!result) {
    return;
  }
  var data = result.parties;
  
  for (var i in data) {
    server.getParty(data[i], parseParty);
  }

  setTimeout(function(){
    server.getParties(result.last_seq, populateParties);
  }, 2000);
};

function populateFriends(data) {
  var newFriends = [];
  for (var i in data) {
    newFriends.push(new friend({
      userId: data[i].id,
      fullName: data[i].name,
    }));
  }
  viewModel.friends(newFriends);
};

function populateUserInfo(data) {
  //viewModel.user(new user({
  var temp = new user({
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name, 
    link: data.link,
    locale: data.locale,
    fullName: data.name,
    timezone: data.timezone
  });
}

function logInOutOfFacebook() {
  if (!viewModel.isLoggedIn()) {
    window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
  } else {
    FB.logout(function(resp) {
      viewModel.user(new user({}));
      viewModel.isLoggedIn(false);
    });
  }
};

function createNewParty() {
  // get information from form
  var title = "default title";
  var description = "default description";
  server.newParty(title, description, function(data) {
      var newParty = parseParty(data);
      window.location = 'index.html?partyId=' + newParty.id;
    });
};

function whereClick() {
}
function whereChange() {
  if (viewModel.selectedParty()) {
    viewModel.selectedParty().whereInfo.location($('.oi-where').val());
  }
}

function whenClick() {
}
function whenChange() {
}

function whoClick() {
}
function whoChange() {
}

function titleClick() {
}
function titleChange() {
  if (viewModel.selectedParty()) {
    viewModel.selectedParty().title($('.oi-title').val());
    updateParty();
  }
}

function descriptionClick() {
}
function descriptionChange() {
  if (viewModel.selectedParty()) {
    viewModel.selectedParty().description($('.oi-description').val());
    updateParty();
  }
}

function updateParty()
{
  var selected = viewModel.selectedParty();

  var source = selected.source;
  source.public = selected.isPublic;
  source.title = selected.title();
  source.description = selected.description();
  source.users = [];

  var sourceUsers = selected.users();
  for (var idx in sourceUsers) {
    var src = sourceUsers[idx];
    var user = {
      userid: src.userId,
      name: src.fullName,
      role: src.role,
      rsvp: src.rsvp
    };
    source.users.push(user);
  }

  server.updateParty(selected.id, source, function(result) {
  });
}

function addItem() {
  server.newItem('New Topic');
}

