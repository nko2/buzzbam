
$(document).ready(function(){
  $('.grid-chatentry').keydown(function(e){
    if (e.which == 13) {
      var text = $('.grid-chatentry').val();
      $('.grid-chatentry').empty();
      server.newChat(viewModel.selectedParty().id, text, function(){});
    }
  });
});
