var async = require('async');
var _ = require('lodash');

var adapters = {
  memory: require('./adapters/memory'),
  mongoose: require('./adapters/mongoose')
};

module.exports = function(model, adapter){
  if (!adapter)
    adapter = recognizeAdapter(model);
  if (!adapter)
    return model;
  if (model.restcraft)
    return model.restcraft;
  adapters[adapter](model);
  actionsSetup(model);
  return model.restcraft;
};

var recognizeAdapter = function(model){
  if (!model)
    return false;
  if (model.modelName && model.model && model.db){
    return 'mongoose';
  }
  return 'memory';
};

var actionsSetup = function(model){
  model.restcraft.routeIndex = function(){
    var $ = joinConfig(arguments);
    return function(req, res, next){
      preSetup(model, $, req, res);
      async.parallel([
        function(callback){
          model.restcraft.count($, function(err, data){
            res.restcraft[$.name + 'Length'] = data;
            res.restcraft[$.name + 'Page'] = $.page[$.name];
            res.restcraft[$.name + 'Items'] = $.items[$.name];
            callback(err);
          });
        },function(callback){
          model.restcraft.index($, function(err, data){
            res.restcraft[$.name+'Index'] = data;
            callback(err);
          });  
        }], function(err){
          postSetup(model, $, req, res);
          next();
        });
    };
  };
  model.restcraft.routeNew = function(){
    return function(req, res, next){
      next();
    };
  };
  model.restcraft.routeCreate = function(){
    var $ = joinConfig(arguments);
    return function(req, res, next){
      preSetup(model, $, req, res);
      model.restcraft.create($, function(err, data){
        res.restcraft[$.name+'Create'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  };
  model.restcraft.routeShow = function(){
    var $ = joinConfig(arguments);
    return function(req, res, next){
      preSetup(model, $, req, res);
      model.restcraft.show($, function(err, data){
        res.restcraft[$.name+'Show'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  };
  model.restcraft.routeEdit = function(){
    return model.restcraft.routeShow.apply(this, arguments);
  },
  model.restcraft.routeUpdate = function(){
    var $ = joinConfig(arguments);
    return function(req, res, next){
      preSetup(model, $, req, res);
      model.restcraft.update($, function(err, data){
        res.restcraft[$.name+'Update'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  },
  model.restcraft.routeDestroy = function(){
    var $ = joinConfig(arguments);
    return function(req, res, next){
      preSetup(model, $, req, res);
      model.restcraft.destroy($, function(err, data){
        res.restcraft[$.name+'Destroy'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  }
}

var integer = function(n){ return n>>0; }
var string = function(s){ return s ? "" + s : null; }

var queryParsing = {
  'limit': integer, 
  'skip': integer, 
  'sort': string, 
  'items': integer, 
  'page': integer 
};

var preSetup = function(model, $, req, res){
  $.id = req.params;
  $.data = req.body;
  $.name = $.name || model.restcraft.name();
  for (var field in queryParsing){
    var alreadyExists = field in $;
    var parse = queryParsing[field];
    var newValue = parse(req.query[$.name + field[0].toUpperCase() + field.substr(1)]);
    var value = alreadyExists ? $[field] : newValue;
    $[field] = {}
    $[field][$.name] = value;
  }
  $.req = req;
  $.res = res;
  if (!res.restcraft)
    res.restcraft = {}
  res.restcraft.$ = $;
};
var postSetup = function(model, $, req, res){
  
};
var joinConfig = function(args){
  args = Array.prototype.slice.call(args);
  var config = _.cloneDeep(args[0] || {});
  for (var i=1; i<args.length; i++){
    _.merge(config, args[i], function(a, b) {
      if (!_.isFunction(a))
        return undefined
      return function(){
        var that = this;
        var args = Array.prototype.slice.call(arguments);
        var originalCallback = args.pop();
        args.push(function(err){
          if(err)
            return originalCallback(err);
          args.pop()
          args.push(originalCallback);
          b.apply(that, args);
        });
        a.apply(this, args);
      }
    });
  }
  return config;
};
