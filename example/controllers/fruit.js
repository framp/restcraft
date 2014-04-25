var $ = require('../..');
var fruit = require('../models/fruit');

var controller = $.controller('fruit', {
  render: function(req, res, next){
    res.send(res.restcraft);
  }
});
controller.add('*', function(req, res, next){
  console.log("FOAR EVERYWUN FRUM BOXXY");
  next();
})
controller.index($(fruit).routeIndex({
  preExecution: function($, query, callback){
    query.skip(1);
    callback();
  }
},{
  preExecution: function($, query, callback){
    query.where('name', 'Apple');
    callback();
  }
}));
controller.new($(fruit).routeNew());
controller.create($(fruit).routeCreate());
controller.show($(fruit).routeShow({idField: 'name'}));
controller.edit($(fruit).routeEdit());
controller.update($(fruit).routeUpdate());
controller.destroy($(fruit).routeDestroy());

module.exports = controller;