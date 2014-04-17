var restcraft = require('../..');
var complexToy = require('../models/complex-toy').restcraft.middleware;
var fruit = require('../models/fruit').restcraft.middleware;

var controller = restcraft('complex-toy', {
  parent: require('./fruit')
, render: function(req, res, next){
    res.send(res.restcraft);
  }
});

controller.index(fruit.show());
controller.index(complexToy.index());
controller.new(complexToy.new());
controller.create(complexToy.create());
controller.show(complexToy.show());
controller.edit(complexToy.edit());
controller.update(complexToy.update());
controller.destroy(complexToy.destroy());

module.exports = controller;