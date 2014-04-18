var async = require('async');

var adapters = {
  memory: require('./adapters/memory'),
  mongoose: require('./adapters/mongoose')
};

module.exports = function(model, adapter){
  adapters[adapter](model);
  model.restcraft.middleware = {
    index: function($){
      $ = $ || {};
      return function(req, res, next){
        reqSetup($, req, res);
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
      $ = $ || {};
      return function(req, res, next){
        next();
      };
    },
    create: function($){
      $ = $ || {};
      return function(req, res, next){
        reqSetup($, req, res);
        model.restcraft.create($, function(err, data){
          res.restcraft[model.restcraft.name()+'-create'] = data;
          next();
        });
      };
    },
    show: function($){
      $ = $ || {};
      return function(req, res, next){
        reqSetup($, req, res);
        model.restcraft.show($, function(err, data){
          res.restcraft[model.restcraft.name()+'-show'] = data;
          next();
        });
      };
    },
    edit: function($){
      $ = $ || {};
      return function(req, res, next){
        next();
      };
    },
    update: function($){
      $ = $ || {};
      return function(req, res, next){
        reqSetup($, req, res);
        model.restcraft.update($, function(err, data){
          res.restcraft[model.restcraft.name()+'-update'] = data;
          next();
        });
      };
    },
    destroy: function($){
      $ = $ || {};
      return function(req, res, next){
        model.restcraft.destroy($, function(err, data){
          res.restcraft[model.restcraft.name()+'-destroy'] = data;
          next();
        });
      };
    }
  };
};

var reqSetup = function($, req, res){
  $.id = req.params[model.restcraft.name()];
  $.data = req.body;
  $.limit = req.query.limit;
  $.skip = req.query.skip;
  $.sort = req.query.sort;
  $.pageLength = req.query.pageLength;
  $.currentPage = req.query.currentPage;
}