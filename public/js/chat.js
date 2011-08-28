
function loadChat(chatid)
{
  server.getComment(chatid, function(chat) {
    if (chat.itemid) {
      var selected = viewModel.selectedParty();
      var items = selected.items();
      for (var index in items) {
        var item = items[index];
        if (item.id == chat.itemid) {
          item.comments.push(new comment(chat));
          break;
        }
      }
    }
    else {
      viewModel.chats.push(chat);
    }
  });
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
