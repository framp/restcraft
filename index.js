var Controller = require('./lib/controller');

module.exports = require('./lib/resource');
module.exports.controller = function(name, options){
  return new Controller(name, options);
}
