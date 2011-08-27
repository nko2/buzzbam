function populateParty(party) {
  var userIds = party.userIds;
  for (var i in party.userIds) {
    $.getJSON('user?id=' + userIds[i], function(data) {
      party.users.push(new user({ }));
    });
  }
};

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
