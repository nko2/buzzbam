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
