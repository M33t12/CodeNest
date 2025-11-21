const mongoose = require("mongoose");

// Question schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length >= 2, "At least two options required"],
  },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
  aiGenerated: { type: Boolean, default: false },
});

// Quiz schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  topic: { type: String, default: "" },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    required: true,
  },
  questions: { type: [questionSchema], required: true },
  totalQuestions: {
    type: Number,
    default: function () {
      return this.questions.length;
    },
  },
  timeLimit: { type: Number, default: 10 }, // in minutes
  isAIGenerated: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Ensure totalQuestions auto-updates
quizSchema.pre("save", function (next) {
  this.totalQuestions = this.questions.length;
  next();
});

module.exports = mongoose.model("Quiz", quizSchema);
