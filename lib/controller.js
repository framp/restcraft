var debug = require('debug')('restcraft:controller');

var async = require('async');
var pluralize = require('pluralize');
var lodash = require('lodash');

var actions = require('./actions');
var actionsKeys = Object.keys(actions);

var hyphenate = function(str){
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

var route = function(config){  
  var _ = function(router){
    actionsKeys.map(function(action){
      var req = actions[action](_.controllerName);
      var method = req[0];
      var url = req[1];
      if (!url || !_.handlers[action].length)
        return;
      debug(method.toUpperCase() + ' ' + url, _.handlers[action].length + ' functions');
      router[method](url, run.bind(_, _.handlers, action, _.render));
    });
  }
  for (var i in config){
    _[i] = config[i];
  }
  
  actionsKeys.map(function(action){
    _[action] = (function(fn){
      if (!fn)
        return run.bind(_, _.handlers, action, false);
      this.handlers[action] = this.handlers[action].concat(fn);
    }).bind(_);
  });
  
  _.add = (function(action, fn){
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
  }).bind(_);
  
  _.redirect = (function(action, options){
    options = options || {};
    options.params = options.params || {};
    var url = actions[action](this.controllerName)[1];
    return function(req, res, next){
      var filledUrl = url.replace(/\/:([^\/]+)/g, function(match, param){
        if (!options.params[param] && !req.params[param])
          return '';
        return '/' + (options.params[param] || req.params[param]);
      });
      var pre = '';
      var controllerName = res.restcraft.__controller;
      var startsWithSingular = req.originalUrl.indexOf(controllerName.singular);
      var startsWithPlural = req.originalUrl.indexOf(controllerName.plural);
      var parent = controllerName.parent.split('/');
      var startsWithParent = -1;
      if (parent && parent.length>=2){
        startsWithParent = req.originalUrl.indexOf(parent[1]);
      }
      if (startsWithSingular!==-1)
        pre = req.originalUrl.substr(0, startsWithSingular);
      if (startsWithPlural!==-1)
        pre = req.originalUrl.substr(0, startsWithPlural);
      if (startsWithParent!==-1)
        pre = req.originalUrl.substr(0, startsWithParent);
      res.redirect(pre + filledUrl.substr(1));
    }
  }).bind(_);
  
  return _;
}

var run = function(handlers, action, render, req, res, next){
  if (!res.restcraft)
    res.restcraft = {};
  if (!res.restcraft.__action){
    res.restcraft.__path = this.templatePath;
    res.restcraft.__action = action;
    res.restcraft.__controller = this.controllerName;
  }
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

module.exports = function(name, options){
  options = options || {};
  var config = {};
  options.parent = options.parent || '';
  config.parent = options.parent;
  if (options.parent && !options.parent.basePath){
    var parentName = { 
      singular: options.parent, 
      plural: options.parentPlural || pluralize(options.parent)
    }
    options.parent = actions.show(parentName)[1];
  }
  if (options.parent.basePath)
    options.parent = options.parent.basePath;
  config.handlers = {};
  for (var action in actions){
    config.handlers[action] = [];
  }
  var hyphenatedName = hyphenate(name);
  var hyphenatedPlural = hyphenate(options.plural || '');
  config.controllerName = {
    singular: hyphenatedName,
    plural: hyphenatedPlural || pluralize(hyphenatedName),
    alias: options.alias,
    model: name,
    parent: options.parent
  };
  config.basePath = actions.show(config.controllerName)[1];
  config.templatePath = config.basePath.replace(/(^\/|\/:[^\/]*)/g, '');
  config.render = options.render===undefined ? function(req, res, next){
    lodash.merge(res.locals, res.restcraft);
    res.render(res.restcraft.__path + '/' + res.restcraft.__action, res.locals);
  } : options.render;
  
  return route(config);
};