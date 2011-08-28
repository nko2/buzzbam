
$(document).ready(function(){
  $('.zone-chat textarea').keydown(function(e){
    if (e.which == 13) {
      var text = $('.zone-chat textarea').val();
      $('.zone-chat textarea').val('');
      server.newChat(text);
      return false;
    }
  });
  $('.oi-ta').keydown(function(e){
    if (e.which == 13) {
      var text = $('.zone-chat textarea').val();
      $('.zone-chat textarea').val('');
      server.newChat(text);
      return false;
    }
  });
});
