var restcraft = require('../..');
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var schema = new Schema({
  name: String,
  weight: Number
});

module.exports = mongoose.model('fruit', schema);
restcraft.resource(module.exports, 'mongoose');