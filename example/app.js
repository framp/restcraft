var path = require('path');

var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bodyDisposal = require('body-disposal');
var consolidate = require('consolidate');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/restcraft-example');
mongoose.set('debug', true);

var app = express();

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(bodyDisposal());

require('./controllers/static')(app);
require('./controllers/fruit')(app);
require('./controllers/complexToy')(app);


app.use(function(req, res, next){
  res.send(res.restcraft);
})

app.listen(process.env.PORT || 3000);