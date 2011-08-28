function parseParty(data) {
  var newParty = new partyInfo({
      id: data.id,
      isPublic: data.public,
      title: data.title,
      description: data.description,
      userIds: data.users,
      itemIds: data.items,
      whereId: data.whereId,
      whenId: data.whenId,
    });

  if (newParty.isPublic) {
    viewModel.publicParties.push(newParty);
  } else {
    viewModel.parties.push(newParty);
  }
};

function populateParties(data) {
  if (!data) {
    return;
  }
  
  if (data.parties) {
    for (var i in data.parties) {
      server.getParty(data.parties[i], parseParty);
    }
  }
  
  if (data.public) {
    for (var i in data.public) {
      server.getParty(data.public[i], parseParty);
    }
  }
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
  window.location = 'http://partyplanner.no.de/index.html';
};

function whereClick() {
}
function whereChange() {
  if (viewModel.selectedParty()) {
    viewModel.selectedParty().title($('.oi-where').text());
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
    viewModel.selectedParty.title($('.oi-title').text());
  }
}

function descriptionClick() {
}
function descriptionChange() {
  if (viewModel.selectedParty()) {
    viewModel.selectedParty.description($('.oi-description').text());
  }
}

