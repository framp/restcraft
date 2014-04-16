var restcraft = require('../..');
var model = require('../models/fruit').restcraft.middleware;

var controller = restcraft('fruit');

controller.index(model.index());
controller.new(model.new());
controller.create(model.create());
controller.show(model.show());
controller.edit(model.edit());
controller.update(model.update());
controller.destroy(model.destroy());

module.exports = controller.route();