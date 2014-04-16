var resourcePlugin = require('./lib/resource');
var Controller = require('./lib/controller');

module.exports = function(name, options){
  return new Controller(name, options);
}
module.exports.resource = resourcePlugin;
