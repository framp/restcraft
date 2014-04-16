var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/restcraft-example');
mongoose.set('debug', true);

var restcraft = require('../../lib/resource');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var schema = new Schema({
  name: String,
  weight: Number
});

var model = mongoose.model('Fruit', schema);
restcraft(model, 'mongoose');
module.exports = model;