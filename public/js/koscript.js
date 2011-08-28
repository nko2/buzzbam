function parseParties(data) {
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
  return newParties;
}

function populateParties(data) {
  var newParties = parseParties(data.parties);
  var publicParties = [];
  var userParties = [];
  
  for (var i in newParties) {
    var party = newParties[i];
    if (party.isPublic) {
      publicParties.push(party);
    } else {
      userParties.push(party);
    }
  }
  viewModel.parties(userParties);
  viewModel.publicParties(publicParties);
  if (viewModel.parties.count > 0) {
    viewModel.selectedParty(viewModel.parties[0]);
  }
};

function populatePublicParties(data) {
  var newParties = parseParties(data);
  viewModel.publicParties(newParties);
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
