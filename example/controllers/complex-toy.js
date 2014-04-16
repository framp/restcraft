var restcraft = require('../..');
var model = require('../models/complex-toy').restcraft.middleware;

var fruitController = require('./fruit');

var controller = restcraft('complex-toy', {
  parent: fruitController
});

controller.index(model.index());
controller.new(model.new());
controller.create(model.create());
controller.show(model.show());
controller.edit(model.edit());
controller.update(model.update());
controller.destroy(model.destroy());

module.exports = controller;