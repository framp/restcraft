var restcraft = require('../..').resource;
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var schema = new Schema({
  name: String,
  movingParts: Number
});

module.exports = mongoose.model('complex-toy', schema);
restcraft(module.exports, 'mongoose');