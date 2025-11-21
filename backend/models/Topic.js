// models/Topic.js

const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  problemCount: {
    type: Number,
    default: 0
  },
  icon: String,
  order: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Topic', TopicSchema);
