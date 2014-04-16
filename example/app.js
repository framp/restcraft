var express = require('express');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/restcraft-example');
mongoose.set('debug', true);

var app = express();


app.get('/', function(req, res){
  res.send('hello world');
});
require('./controllers/fruit')(app);

app.use(function(req, res, next){
  res.send(res.restcraft);
})

app.listen(3000);