
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

function createNewParty() {
  // get information from form
  var title = "default title";
  var description = "default description";
  server.newParty(title, description, function(data) {
      var newParty = parseParty(data);
      window.location = 'party.html?partyId=' + newParty.id;
    });
};

function whereClick() {
}
function whereChange() {
  modelUpdateWhere($('.oi-location').val());
}

function whenClick() {
}
function whenChange() {
  modelUpdateWhen($('.oi-timedate').val());
}

function whoClick() {
}
function whoChange() {
}

function titleClick() {
}
function titleChange() {
  modelUpdateTitle($('.oi-title').val());
}

function descriptionClick() {
}
function descriptionChange() {
  modelUpdateDescription($('.oi-description').val());
}

function updateParty()
{
  server.updateParty(model.party._id, model.party, function(result) {
  });
}

function addItem(message) {
  server.newItem(message);
}

