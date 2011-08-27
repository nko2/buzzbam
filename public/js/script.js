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

var couchInit = function (couch) {
	
}

var createCouch = function (opt, callback) {
	pouch.open(opt.name, function (err, db) {
		ok(!err, 'created a pouch');
		callback(db);
	});
};

var viewModel = {
  couch: createCouch({name: "partyplanner"}, couchInit),
};



ko.applyBindings(viewModel);
