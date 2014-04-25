var async = require('async');
var pluralize = require('pluralize');

var actions = require('./actions');
var actionsKeys = Object.keys(actions);

module.exports = (function(){
  /* Controller
   * Component used to group
   */

  var _ = function(name, options){
    options = options || {};
    options.parent = options.parent || '';
    if (options.parent && !options.parent.basePath){
      var parentName = { 
        singular: options.parent, 
        plural: options.parentPlural || pluralize(options.parent)
      }
      options.parent = actions.show(parentName)[1];
    }
    if (options.parent.basePath)
      options.parent = options.parent.basePath;
    this.handlers = {};
    for (var action in actions){
      this.handlers[action] = [];
    }
    this.name = {
      singular: name,
      plural: options.plural || pluralize(name),
      model: options.model || name,
      alias: options.alias,
      parent: options.parent
    };
    this.basePath = actions.show(this.name)[1];
    this.templatePath = this.basePath.replace(/(^\/|\/:[^\/]*)/g, '');
    this.render = options.render===undefined ? function(req, res, next){
      res.restcraft.locals = res.locals
      res.render(res.restcraft.__path + '/' + res.restcraft.__action, res.restcraft);
    } : options.render;
  };
  
  actionsKeys.map(function(action){
    _.prototype[action] = function(fn){
      this.handlers[action].push(fn);
    };
  });
  
  _.prototype.add = function(action, fn){
    var that = this;
    if (action.indexOf(' ')!==-1){
      action.split(' ').forEach(function(action){
        that.add(action, fn);
      })
      return;
    }
    if (action==='*'){
      actionsKeys.forEach(function(action){
        that[action](fn);
      });
      return;
    }
    
    this[action](fn);
  }
  
  _.prototype.redirect = function(action, options){
    options = options || {};
    options.params = options.params || {};
    var url = actions[action](this.name)[1];
    return function(req, res, next){
      var filledUrl = url.replace(/\/:([^\/]+)/g, function(match, param){
        if (!options.params[param] && !req.params[param])
          return '';
        return '/' + (options.params[param] || req.params[param]);
      });
      res.redirect(filledUrl);
    }
  }
  
  _.prototype.route = function(){
    var that = this;
    var name = this.name;
    var handlers = this.handlers;
    return function(router){
      actionsKeys.map(function(action){
        var req = actions[action](name);
        var method = req[0];
        var url = req[1];
        if (!url || !handlers[action].length)
          return;
        console.log(method, url, handlers[action]);
        router[method](url, run.bind(that, handlers, action));
      });
    };
  }
  
  return _;
})();

var run = function(handlers, action, req, res, next){
  if (res.restcraft && res.restcraft.__action) 
    return next();
  var render = this.render;
  
  if (!res.restcraft)
    res.restcraft = {};
  res.restcraft.__path = this.templatePath;
  res.restcraft.__action = action;
  async.series(handlers[action].map(function(fn) {
    return function(cb){
      fn(req, res, cb);
    };
  }), function(err){
    if (!render)
      return next();
    render(req, res, next);
  });
};