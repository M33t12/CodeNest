// models/Problem.js
const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  leetcodeId: {
    type: String,
    required: true,
    unique: true
  },
  titleSlug: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  topics: [{
    type: String
  }],
  companies: [{
    type: String
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  acRate: Number,
  totalAccepted: Number,
  totalSubmission: Number,
  leetcodeUrl: String,
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ProblemSchema.index({ difficulty: 1, topics: 1 });
ProblemSchema.index({ titleSlug: 1 });

module.exports = mongoose.model('Problem', ProblemSchema);
