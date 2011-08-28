
function loadChat(chatid)
{
  server.getComment(chatid, parseComment);
}

function prepareChat(id,seq)
{
  // get it started
  server.getComments(id, seq, function (result) {
    var chats = result.comments;
    for (var index in chats) {
      var chatid = chats[index];
      loadChat(chatid);
    }
    setTimeout(function(){prepareChat(id, result.last_seq);}, 500);
  });
}

$(document).ready(function() {
  var prepared = false;
  viewModel.selectedParty.subscribe(function (newValue) {
    if (!prepared) {
      prepared = true;
      prepareChat(newValue.id, 0);
      prepareItems(newValue.id, 0);
    }
  });
});
