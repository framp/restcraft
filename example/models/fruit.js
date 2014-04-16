var mongoose = require('mongoose');

var restcraft = require('../..').resource;
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var schema = new Schema({
  name: String,
  weight: Number
});

module.exports = mongoose.model('Fruit', schema);
restcraft(module.exports, 'mongoose');