var async = require('async');
var _ = require('lodash');

var adapters = {
  memory: require('./adapters/memory'),
  object: require('./adapters/object'),
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
  return 'object';
};

var toParams = function (params) {
  var pairs, proc;
  pairs = [];
  (proc = function(object, prefix) {
    var el, i, key, value, _results;
    if (object == null) object = params;
    if (prefix == null) prefix = null;
    _results = [];
    for (key in object) {
      if (!object.hasOwnProperty(key)) continue;
      value = object[key];
      if (value instanceof Array) {
        _results.push((function() {
          var _len, _results2;
          _results2 = [];
          for (i = 0, _len = value.length; i < _len; i++) {
            el = value[i];
            _results2.push(proc(el, prefix != null ? "" + prefix + "[" + key + "][]" : "" + key + "[]"));
          }
          return _results2;
        })());
      } else if (value instanceof Object) {
        if (prefix != null) {
          prefix += "[" + key + "]";
        } else {
          prefix = key;
        }
        _results.push(proc(value, prefix));
      } else {
        _results.push(pairs.push(prefix != null ? "" + prefix + "[" + key + "]=" + value : "" + key + "=" + value));
      }
    }
    return _results;
  })();
  return pairs.join('&');
};

var actionsSetup = function(model){
  model.restcraft.routeIndex = function(){
    var config = joinConfig(arguments);
    return function(req, res, next){
      var $ = _.clone(config);
      preSetup(model, $, req, res);
      async.parallel([
        function(callback){
          model.restcraft.count($, function(err, data){
            res.restcraft[$.name + 'Length'] = data;
            res.restcraft[$.name + 'Page'] = $.page;
            res.restcraft[$.name + 'Items'] = $.items;
            res.restcraft[$.name + 'Sort'] = $.sort;
            res.restcraft[$.name + 'Order'] = $.order;
            res.restcraft[$.name + 'Filter'] = $.filter;
            if ($.filter) {
              var data = {};
              data[$.name + 'Filter'] = $.filter;
              res.restcraft[$.name + 'FilterString'] = toParams(data);
            }
            res.restcraft[$.name + 'Search'] = $.search;
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
    var config = joinConfig(arguments);
    return function(req, res, next){
      var $ = _.clone(config);
      preSetup(model, $, req, res);
      model.restcraft.create($, function(err, data){
        res.restcraft[$.name+'Create'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  };
  model.restcraft.routeShow = function(){
    var config = joinConfig(arguments);
    return function(req, res, next){
      var $ = _.clone(config);
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
    var config = joinConfig(arguments);
    return function(req, res, next){
      var $ = _.clone(config);
      preSetup(model, $, req, res);
      model.restcraft.update($, function(err, data){
        res.restcraft[$.name+'Update'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  },
  model.restcraft.routeDestroy = function(){
    var config = joinConfig(arguments);
    return function(req, res, next){
      var $ = _.clone(config);
      preSetup(model, $, req, res);
      model.restcraft.destroy($, function(err, data){
        res.restcraft[$.name+'Destroy'] = data;
        postSetup(model, $, req, res);
        next();
      });
    };
  }
}

var integer = function(n){ return n>>0; };
var string = function(s){ return s ? "" + s : null; };
var anything = function(o){ return o; };

var queryParsing = {
  'limit': integer, 
  'skip': integer, 
  'sort': anything, 
  'order': string, 
  'filter': anything, 
  'search': string,
  'items': integer, 
  'page': integer 
};

var preSetup = function(model, $, req, res){
  $.id = req.params;
  $.data = req.body;
  $.name = $.name || model.restcraft.name();
  for (var field in queryParsing){
    var parse = queryParsing[field];
    var fieldName = $.name + field[0].toUpperCase() + field.substr(1);
    if (!(field in $) && (fieldName in req.query))
      $[field] = parse(req.query[fieldName]);
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
          args.pop();
          args.push(originalCallback);
          b.apply(that, args);
        });
        a.apply(this, args);
      }
    });
  }
  return config;
};
