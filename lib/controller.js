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
    options.parent = options.parent || {};
    if (options.parent.basePath)
      options.parent = options.parent.basePath;
    this.handlers = {};
    for (var action in actions){
      this.handlers[action] = [];
    }
    this.name = {
      singular: name,
      plural: options.plural || pluralize(name),
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
        //console.log(method, url, handlers[action].length);
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