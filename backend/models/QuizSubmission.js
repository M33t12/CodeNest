const mongoose = require('mongoose');

// User response schema (no precomputed tips)
const userResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userResponse: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  correctAnswer: { type: String }
});

// Main submission schema
const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  responses: { type: [userResponseSchema], required: true },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  attemptNumber: { type: Number, default: 1 },
  aiSummary: { type: [String] }, // feedback after submission
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  hintRequests: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId },
      hint: { type: String },
      requestedAt: { type: Date, default: Date.now }
    }
  ]
});

// Auto-calculate score before saving
submissionSchema.pre('save', function(next) {
  this.score = this.responses.filter(r => r.isCorrect).length;
  next();
});


module.exports = mongoose.model('QuizSubmission', submissionSchema);
