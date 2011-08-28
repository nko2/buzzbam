function parseParty(data) {
  var newParty = new partyInfo({
      id: data._id,
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
  
  return newParty;
};

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
  var title = escape("default title");
  var description = escape("default description");
  window.location = 'index.html?partyId=new&title=' +
                    title + '&description=' + description;
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

function addItem() {
  var selectedParty = viewModel.selectedParty();
  if (selectedParty) {
    var partyId = selectedParty.id;
    server.newItem(partyId, 'New Topic', parseItem);
  }
}

function parseItem(data) {
  var newItem = new item(data);
  var selectedParty = viewModel.selectedParty();
  if (selectedParty && selectedParty.id === newItem.partyid) {
    var existingItems = selectedParty.items();
    for (var index in existingItems) {
      var existing = existingItems[index];
      if (existing.id == newItem.id) {
        // ignore duplicates
        return;
      }
    }
    selectedParty.items.push(newItem);
  }
}

function parseComment(data) {
  return new comment({
     id: data._id,
     text: data.text,
     time: data.time,
  });
}

