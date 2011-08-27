function populateParty(party) {
  var userIds = party.userIds;
  for (var i in party.userIds) {
    $.getJSON('user?id=' + userIds[i], function(data) {
      party.users.push(new user({ }));
    });
  }
};

function populateParties(data) {
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
  if (parties.count > 0) {
    viewModel.selectedParty(parties[0]);
  }
};

function populateUserInfo(data) {
  //viewModel.user(new user({
  var temp = new user({});
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
