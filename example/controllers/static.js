var restcraft = require('../..');

var controller = restcraft('', {
  render: function(req, res, next){
    res.send(res.restcraft);
  },
  alias: true
});

controller.show(function(req, res, next){ 
  next();
});

module.exports = controller;