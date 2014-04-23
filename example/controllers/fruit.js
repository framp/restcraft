var restcraft = require('../..');
var fruit = require('../models/fruit').restcraft.middleware;

var controller = restcraft('fruit', {
  render: function(req, res, next){
    res.send(res.restcraft);
  }
});
controller.add('*', function(req, res, next){
  console.log("FOAR EVERYWUN FRUM BOXXY");
  next();
})
controller.index(fruit.index({
  hooks: {
    preExecution: function($, query, callback){
      query.skip(1);
      callback(null, $, query);
    }
  }
}));
controller.new(fruit.new());
controller.create(fruit.create());
controller.show(fruit.show({idField: 'name'}));
controller.edit(fruit.edit());
controller.update(fruit.update());
controller.destroy(fruit.destroy());

module.exports = controller;