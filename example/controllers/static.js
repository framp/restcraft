var $ = require('../..');

var controller = $.controller('', {
  render: function(req, res, next){
    res.send(res.restcraft);
  },
  alias: true
});

controller.show(function(req, res, next){ 
  next();
});

module.exports = controller.route();