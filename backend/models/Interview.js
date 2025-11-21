// models/Interview.js
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  interviewType: {
    type: String,
    enum: ['technical', 'non-technical'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['initialized', 'in-progress', 'completed', 'cancelled'],
    default: 'initialized'
  },
  conversation: [{
    speaker: {
      type: String,
      enum: ['ai', 'user'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    audioTranscription: {
      type: Boolean,
      default: false
    }
  }],
  questionsAsked: [{
    question: String,
    answer: String,
    timestamp: Date,
    evaluationScore: Number,
    feedback: String
  }],
  performanceMetrics: {
    technicalAccuracy: Number,
    communicationSkills: Number,
    problemSolving: Number,
    overallScore: Number,
    confidenceLevel: String
  },
  finalFeedback: {
    textFeedback: String,
    audioFeedback: String, // Base64 or URL to audio file
    strengths: [String],
    improvements: [String],
    recommendations: [String]
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Method to calculate duration
interviewSchema.methods.calculateDuration = function() {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  return this.duration;
};

// Method to add conversation message
interviewSchema.methods.addMessage = function(speaker, message, audioTranscription = false) {
  this.conversation.push({
    speaker,
    message,
    audioTranscription,
    timestamp: new Date()
  });
};

// Method to update status
interviewSchema.methods.updateStatus = function(status) {
  this.status = status;
  if (status === 'completed') {
    this.endTime = new Date();
    this.calculateDuration();
  }
};

// Add this before the Interview model export
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ sessionId: 1 });
interviewSchema.index({ status: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;