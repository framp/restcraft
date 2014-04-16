var Controller = require('../..').Controller;
var model = require('../models/fruit').restcraft.middleware;

var controller = Controller('fruit');

controller.index(model.index());
controller.new(model.new());
controller.create(model.create());
controller.show(model.show());
controller.edit(model.edit());
controller.update(model.update());
controller.delete(model.delete());

module.exports = controller.route;