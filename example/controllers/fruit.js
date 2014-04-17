var restcraft = require('../..');
var fruit = require('../models/fruit').restcraft.middleware;

var controller = restcraft('fruit');

controller.index(fruit.index());
controller.new(fruit.new());
controller.create(fruit.create());
controller.show(fruit.show());
controller.edit(fruit.edit());
controller.update(fruit.update());
controller.destroy(fruit.destroy());

module.exports = controller;