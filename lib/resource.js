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
        async.parallel([
          function(){
            model.restcraft.count($, function(err, data){
              res.restcraft[model.restcraft.name()+'Length'] = data;
            });
          },function(){
            model.restcraft.index($, function(err, data){
              res.restcraft[model.restcraft.name()+'Index'] = data;
            });  
          }], next);
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
        model.restcraft.create($, function(err, data){
          res.restcraft[model.restcraft.name()+'Create'] = data;
          next();
        });
      };
    },
    show: function($){
      $ = $ || {};
      return function(req, res, next){
        model.restcraft.show($, function(err, data){
          res.restcraft[model.restcraft.name()+'Show'] = data;
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
        model.restcraft.update($, function(err, data){
          res.restcraft[model.restcraft.name()+'Update'] = data;
          next();
        });
      };
    },
    destroy: function($){
      $ = $ || {};
      return function(req, res, next){
        model.restcraft.destroy($, function(err, data){
          res.restcraft[model.restcraft.name()+'Destroy'] = data;
          next();
        });
      };
    }
  };
};