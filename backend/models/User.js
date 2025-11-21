// /backend/models/user.js 
const mongoose = require('mongoose');
const Resource = require("./Resource.js");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required : true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Add user status for blocking functionality
  status: {
    type: String,
    enum: ['active', 'blocked', 'suspended'],
    default: 'active'
  },
  profile: {
    linkedin: String,
    github: String,
    bio: String,
    profileImage: String,
    website:String,
  },
  resourcesUploaded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Resource
  }],
  dsaProgress: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    solvedQuestions: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAQuestion' },
      status: { type: String, enum: ['solved', 'attempted', 'unsolved'], default: 'unsolved' },
      solvedAt: Date
    }]
  },
  quizHistory: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: Number,
    totalQuestions: Number,
    completedAt: Date
  }],
  interviewHistory: [{
    type: { type: String, enum: ['technical', 'non-technical'] },
    subject: String,
    score: Number,
    feedback: String,
    completedAt: Date
  }],
  // Add admin tracking fields
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Track which admin created this user (if applicable)
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Track which admin blocked this user
  },
  blockedAt: Date,
  blockReason: String
}, {
  timestamps: true
});

// New pre-save middleware to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// Add method to get user activity summary
userSchema.methods.getActivitySummary = function() {
  return {
    totalResourcesUploaded: this.resourcesUploaded.length,
    totalQuizzesTaken: this.quizHistory.length,
    totalInterviewsTaken: this.interviewHistory.length,
    dsaProgress: {
      totalSolved: this.dsaProgress.totalSolved,
      easySolved: this.dsaProgress.easySolved,
      mediumSolved: this.dsaProgress.mediumSolved,
      hardSolved: this.dsaProgress.hardSolved
    },
    averageQuizScore: this.quizHistory.length > 0 
      ? this.quizHistory.reduce((acc, quiz) => acc + (quiz.score / quiz.totalQuestions * 100), 0) / this.quizHistory.length 
      : 0,
    lastLoginAt: this.lastLoginAt,
    accountStatus: this.status,
    memberSince: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);