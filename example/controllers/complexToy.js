var $ = require('../..');
var complexToy = require('../models/complexToy');
var fruit = require('../models/fruit');

var name = 'complexToy';
var controller = $.controller(name, {
  parent: require('./fruit')
, render: function(req, res, next){
    if (!res.restcraft.$)
      res.restcraft.$ = {};
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
controller.edit(controller.parent.show());
controller.update($(complexToy).routeUpdate());
controller.destroy($(complexToy).routeDestroy());

module.exports = controller;