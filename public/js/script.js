function updateUserData() {
  server.getUserAndFriends(function(data) {
    viewModel.isLoggedIn(data.me.id ? true : false);
    viewModel.user(new user({ fullName: data.me.name }));
    populateFriends(data.friends);
    server.getParties(populateParties);
    if (data.me.id) {
      server.getUserInfo(data.me.id, populateUserInfo);
    }
  });
}

function log(x) {
  console.log(x);
}

var server = (function() {
  var that = {};

  var uuids = [];

  function getUuid(callback) {
    if (uuids.length > 0) {
      callback(uuids.pop());
    }
    else {
      $.getJSON('uuids', function(ids) {
        uuids = ids;
        getUuid(callback);
      });
    }
  }

  // returns {first_name,last_name,name,id, ... }
  that.getUserInfo = function(id, callback) {
    //console.log('getUserInfo');
    $.getJSON('user', {id:id}, callback);
  };

  // returns {me:{id?,name},friends:[{id,name}*]}
  that.getUserAndFriends = function(callback) {
    //console.log('getUserAndFriends');
    $.getJSON('friends', callback);
  };

  that.newItem = function(description) {
    //console.log('newItem');
    getUuid(function(uuid){

      var newItem = {
        task: true,
        done: false,
        partyid: viewModel.selectedParty().id,
        description: description
      };

      $.post('newitem', {uuid:uuid,item:JSON.stringify(newItem)}, function(){}, 'json');

      newItem._id = uuid;
      parseItem(newItem);
    });
  };

  that.newChat = function(message) {
    //console.log('newChat');
    getUuid(function(uuid){
      var user = viewModel.user();
      var newChat = {
        partyid: viewModel.selectedParty().id,
        user: user.userId,
        name: user.fullName,
        message: message,
        time: new Date()
      };
      $.post('newcomment', {uuid:uuid, comment:JSON.stringify(newChat)}, function(){}, 'json');

      newChat._id = uuid;
      parseComment(newChat);
    });
  };

  that.newComment = function(itemid, message) {
    //console.log('newComment');
    getUuid(function(uuid){
      var user = viewModel.user();
      var newComment = {
        partyid: viewModel.selectedParty().id,
        itemid: itemid,
        user: user.userId,
        name: user.fullName,
        message: message,
        time: new Date()
      };
      $.post('newcomment', {uuid:uuid, comment:JSON.stringify(newComment)}, function(){}, 'json');

      newComment._id = uuid;
      parseComment(newComment);
    });
  };

  that.newParty = function(title, description, callback) {
    //console.log('newParty');
    var data = { title: title };
    if (description) {
      data.description = description;
    }
    $.getJSON('newparty', data, callback);
  };

  that.getParty = function(id, callback) {
    //console.log('getParty');
    $.getJSON('party', {id:id}, function(data) {
        if (data && data._id) {
          callback(data);
        } else {
          // try again since not in the middle-tier yet
          setTimeout(function() {
            that.getParty(id, callback);
          }, 500);
        }
      });
  };

  that.updateParty = function(id, party, callback) {
    //console.log('updateParty');
    $.post('updateparty', {party:party}, callback, 'json');
  };

  that.getParties = function(since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    //console.log('getParties');
    $.getJSON('parties', {since:since}, callback);
  };

  that.getPublicParties = function(callback) {
    //console.log('getPublicParties');
    $.getJSON('parties', {public:true}, callback);
  };

  that.getItems = function(partyid, since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    //console.log('getItems');
    $.getJSON('items', {partyid:partyid,since:since}, callback);
  };

  that.getItem = function(itemid, callback) {
    //console.log('getItem');
    $.getJSON('item', {itemid:itemid}, callback);
  };

  that.getComments = function(partyid, since, callback) {
    //console.log('getComments');
    $.getJSON('comments', {partyid:partyid,since:since}, callback);
  };

  that.getComment = function(commentid, callback) {
    //console.log({getComment:commentid});
    $.getJSON('comment', {commentid:commentid}, callback);
  };

  return that;
})();

var server_local = (function() {
  var that = {};

  // returns {first_name,last_name,name,id, ... }
  that.getUserInfo = function(id, callback) {
    callback({id:id,name:'Anonymous'});
  };

  // returns {me:{id?,name},friends:[{id,name}*]}
  that.getUserAndFriends = function(callback) {
    callback({me:{name:'Anoymous'},friends:[]});
  };

  var curItemId = 0;
  that.newItem = function(partyid, description, callback) {
    callback({
        _id: curItemId++,
        isTodo: curItemId%2 == 0,
        isDone: curItemId%3 == 0,
        description: description + curItemId,
        comments: [],
      });
  };

  that.newComment = function(itemid, message, callback) {
    callback({
        _id: curItemId++,
        userId: viewModel.user().id,
        text: message,
        itemId: itemid,
        time: Date.now(),
      });
  };

  that.newParty = function(title, description, callback) {
    callback({});
  };

  that.getParty = function(id, callback) {
    callback({
      _id:id,
      title:'Title',
      description:'Description',
      users:[],
      where:{},
      items:[],
      when:{}
    });
  };

  that.updateParty = function(id, party, callback) {
    callback({});
  };

  that.getParties = function(since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    callback({parties:['12313452355234532','234523452353242345'],
              public:['3245234532243553242345','2345532432452354']});
  };

  that.getPublicParties = function(callback) {
    callback([]);
  };

  that.getItems = function(partyid, since, callback) {
    if (!callback) {
      callback = since;
      since = undefined;
    }
    callback([]);
  };

  that.getItem = function(itemid, callback) {
    callback({});
  };

  that.getComments = function(partyid, since, callback) {
    callback([]);
  };

  that.getComment = function(commentid, callback) {
    callback({});
  };

  return that;
})();


