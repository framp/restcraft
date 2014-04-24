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
      $ = joinConfig(arguments);
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
    "new": function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
        next();
      };
    },
    create: function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        console.log($);
        model.restcraft.create($, function(err, data){
          res.restcraft[model.restcraft.name()+'-create'] = data;
          next();
        });
      };
    },
    show: function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        model.restcraft.show($, function(err, data){
          res.restcraft[model.restcraft.name()+'-show'] = data;
          next();
        });
      };
    },
    edit: function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
        next();
      };
    },
    update: function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
        reqSetup(model, $, req, res);
        model.restcraft.update($, function(err, data){
          res.restcraft[model.restcraft.name()+'-update'] = data;
          next();
        });
      };
    },
    destroy: function($){
      $ = joinConfig(arguments);
      return function(req, res, next){
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
};
var joinConfig = function(args){
  args = Array.prototype.slice.call(args);
  var config = _.cloneDeep(args[0] || {});
  for (var i=1; i<args.length; i++){
    _.merge(config, args[i]);
  }
  return config;
};
