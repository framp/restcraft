var express = require('express');
var mongoose = require('mongoose');
var consolidate = require('consolidate');
var path = require('path');

mongoose.connect('mongodb://localhost/restcraft-example');
mongoose.set('debug', true);

var app = express();

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');


app.get('/', function(req, res){
  res.send('hello world');
});
require('./controllers/fruit').route()(app);
require('./controllers/complex-toy').route()(app);


app.use(function(req, res, next){
  res.send(res.restcraft);
})

app.listen(3000);