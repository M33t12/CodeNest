const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // optional auth middleware

const quizController = require('../controllers/quizController');

// ================= Quiz Generation / Fetch ==================

// Fetch an existing quiz by ID
router.get('/:quizId', protect, quizController.getQuizById);

// Generate a new quiz dynamically (AI or template)
router.post('/generate', protect, quizController.generateQuiz);

// ================= Quiz Attempt / Tips ==================

// Request a hint for a specific question
router.post('/hint/:quizId', protect, quizController.getQuestionHint);

// ================= Quiz Submission ==================

// Submit a completed quiz
router.post('/submit', protect, quizController.submitQuiz);

// ================= Quiz History / Re-attempt ==================

// Fetch past submissions for a user
router.get('/history/:userId', protect, quizController.getUserQuizHistory);

// Re-attempt a quiz (returns questions for retry)
router.post('/re-attempt/:quizId', protect, quizController.reAttemptQuiz);

module.exports = router;
