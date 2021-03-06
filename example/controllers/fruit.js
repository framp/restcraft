var $ = require('../..');
var fruit = require('../models/fruit');

var name = 'fruit';
var controller = $.controller(name, {
  render: function(req, res, next){
    res.restcraft.$.res = undefined;
    res.restcraft.$.req = undefined;
    res.restcraft.$.model = undefined;
    console.log(res.restcraft);
    res.send(res.restcraft);
  }
});
controller.add('*', function(req, res, next){
  console.log("FOAR EVERYWUN FRUM BOXXY");
  next();
})
controller.index($(fruit).routeIndex({
  preExecution: function(query, next){
    console.log(this);
    query.skip(1);
    next();
  }
},{
  preExecution: function(query, next){
    query.where('name', 'Apple');
    next();
  }
}));
controller.new($(fruit).routeNew());
controller.create($(fruit).routeCreate());
controller.show($(fruit).routeShow({idField: 'name'}));
controller.edit($(fruit).routeEdit());
controller.update($(fruit).routeUpdate());
controller.destroy($(fruit).routeDestroy());

module.exports = controller;