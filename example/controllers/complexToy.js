var $ = require('../..');
var complexToy = require('../models/complexToy');
var fruit = require('../models/fruit');

var controller = $.controller('complexToy', {
  parent: require('./fruit')
, render: function(req, res, next){
    res.restcraft.$.res = undefined;
    res.restcraft.$.req = undefined;
    res.restcraft.$.model = undefined;
    res.send(res.restcraft);
  }
});

controller.index($(fruit).routeShow());
controller.index($(complexToy).routeIndex({ name: "toy"}));
controller.new($(complexToy).routeNew());
controller.create($(complexToy).routeCreate());
controller.show($(complexToy).routeShow());
controller.edit($(complexToy).routeEdit());
controller.update($(complexToy).routeUpdate());
controller.destroy($(complexToy).routeDestroy());

module.exports = controller;