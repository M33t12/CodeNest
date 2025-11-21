// models/UserProgress.js

const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'attempted', 'solved'],
    default: 'not-started'
  },
  notes: {
    type: String,
    maxlength: 5000
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  lastAttempted: Date,
  solvedAt: Date,
  timeSpent: Number, // in minutes
  approach: String,
  tags: [String]
}, {
  timestamps: true
});

// Compound index to ensure one progress entry per user per problem
UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
