/* Author:

*/

$(document).ready(function() {
  $.getJSON('getuser', function(data) {
    if (data.user) {
      $('.loggedin').text(data.user.name);
    }
    else {
      var anchor = $('<a/>');
      anchor.attr('href', 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login');
      anchor.text('Login with Facebook');
      $('.loggedin').empty().append(anchor);
    }
  });
});

var viewModel = {
};

ko.applyBindings(viewModel);

