
function loadChat(chatid)
{
  server.getComment(chatid, function(chat) {
    viewModel.chats.push(chat);
  });
}

function getChats()
{
  server.longPollCommentChanges("59a7245936b94ea159abbbd75a001000", function(chats) {

    for (var index in chats) {
      var chatid = chats[index];
      loadChat(chatid);
    }

    // get more
    getChats();
  });
}

function prepareChat()
{
  // get it started
  server.getComments("59a7245936b94ea159abbbd75a001000", function (chats) {
    for (var index in chats) {
      var chatid = chats[index];
      loadChat(chatid);
    }
  });
  getChats();
}

