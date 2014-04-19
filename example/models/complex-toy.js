var restcraft = require('../..');
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var schema = new Schema({
  name: String,
  movingParts: Number,
  fruit: { type: ObjectId, ref: 'Fruit' }
});

module.exports = mongoose.model('complex-toy', schema);
restcraft.resource(module.exports, 'mongoose');