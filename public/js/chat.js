
function loadChat(chatid)
{
  server.getComment(chatid, function(chat) {
    viewModel.chats.push(chat);
  });
}

function getChats(id)
{
  server.longPollCommentChanges(id, function(chats) {

    for (var index in chats) {
      var chatid = chats[index];
      loadChat(chatid);
    }

    // get more
    getChats(id);
  });
}

function prepareChat(id)
{
  // get it started
  server.getComments(id, function (chats) {
    for (var index in chats) {
      var chatid = chats[index];
      loadChat(chatid);
    }
  });
  getChats(id);
}

$(document).ready(function() {
  var prepared = false;
  viewModel.selectedParty.subscribe(function (newValue) {
    if (!prepared) {
      prepared = true;
      prepareChat(newValue.id);
    }
  });
});
