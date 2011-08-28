
function loadChat(chatid)
{
  server.getComment(chatid, modelNewComment);
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

