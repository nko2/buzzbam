
$(document).ready(function(){
  $('.grid-chatentry').keydown(function(e){
    if (e.which == 13) {
      var text = $('.grid-chatentry').val();
      $('.grid-chatentry').val('');
      server.newChat(text);
    }
  });
});
