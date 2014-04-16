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
  };
  
  actionsKeys.map(function(action){
    _.prototype[action] = function(fn){
      this.handlers.push(fn);
    };
  });
  
  _.prototype.route = function(router){
    var name = this.name;
    var handlers = this.handlers;
    actionsKeys.map(function(action){
      var req = actions[action](name);
      var method = req[0];
      var url = req[1];
      if (!url)
        return
      router[method](url, run.bind(null, handlers[action]));
    });
  };
  
  return _;
})();

var run = function(handlers, req, res, done){
  async.series(handlers.map(function(fn) {
    return function(cb){
      fn(req, res, cb);
    };
  }), done);
};