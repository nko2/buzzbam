
function loadItem(itemid)
{
  server.getItem(itemid, function(i) {
    viewModel.selectedParty().items.push(new item(i));
  });
}

function prepareItems(id, seq)
{
  server.getItems(id, seq, function (result) {
    var items = result.items;
    for (var index in items) {
      var itemid = items[index];
      loadItem(itemid);
    }
    setTimeout(function(){prepareItems(id, result.last_seq);}, 1200);
  });
}
