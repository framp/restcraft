var async = require('async');
var _ = require('lodash');

var adapters = {
  memory: require('./adapters/memory'),
  mongoose: require('./adapters/mongoose')
};

module.exports = function(model, adapter){
  adapters[adapter](model);
  model.restcraft.middleware = {
    index: function(){
      console.log('index');
      var $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        async.parallel([
          function(callback){
            model.restcraft.count($, function(err, data){
              res.restcraft[model.restcraft.name()+'-length'] = data;
              callback(err);
            });
          },function(callback){
            model.restcraft.index($, function(err, data){
              res.restcraft[model.restcraft.name()+'-index'] = data;
              callback(err);
            });  
          }], function(err){
            next();
          });
      };
    },
    "new": function(){
      return function(req, res, next){
        next();
      };
    },
    create: function(){
      console.log('create');
      var $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        console.log($);
        model.restcraft.create($, function(err, data){
          res.restcraft[model.restcraft.name()+'-create'] = data;
          next();
        });
      };
    },
    show: function(){
      console.log('show');
      var $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        model.restcraft.show($, function(err, data){
          res.restcraft[model.restcraft.name()+'-show'] = data;
          next();
        });
      };
    },
    edit: function(){
      return model.restcraft.middleware.show.apply(this, arguments);
    },
    update: function(){
      console.log('update');
      var $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        model.restcraft.update($, function(err, data){
          res.restcraft[model.restcraft.name()+'-update'] = data;
          next();
        });
      };
    },
    destroy: function(){
      console.log('destroy');
      var $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        model.restcraft.destroy($, function(err, data){
          res.restcraft[model.restcraft.name()+'-destroy'] = data;
          next();
        });
      };
    }
  };
};

var reqSetup = function(model, $, req, res){
  $.id = req.params;
  $.data = req.body;
  $.limit = req.query.limit;
  $.skip = req.query.skip;
  $.sort = req.query.sort;
  $.pageLength = req.query.pageLength;
  $.currentPage = req.query.currentPage;
  $.req = req;
  $.res = res;
  if (!res.restcraft)
    res.restcraft = {}
  res.restcraft.$ = $;
};
var joinConfig = function(args){
  args = Array.prototype.slice.call(args);
  console.log('ARGS',args);
  var config = _.cloneDeep(args[0] || {});
  for (var i=1; i<args.length; i++){
    _.merge(config, args[i], function(a, b) {
      return _.isFunction(a) ? async.compose(a, b) : undefined;
    });
  }
  console.log('CONFIG',config);
  return config;
};
