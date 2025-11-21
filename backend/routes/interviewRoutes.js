// routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const interviewController = require('../controllers/interviewControllers.js');
const { protect } = require('../middlewares/authMiddleware'); // optional auth middleware

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Route 1: Initialize interview session
router.post('/start', protect, interviewController.startInterview);

// Route 2: Send user message/response (text or transcribed audio)
router.post('/message',protect, interviewController.sendMessage);

// Route 3: Transcribe audio to text
router.post('/transcribe',protect, upload.single('audio'), interviewController.transcribeAudio);

// Route 4: Get next AI question/response
router.post('/next-question',protect, interviewController.getNextQuestion);

// Route 5: Complete interview and get feedback
router.post('/complete',protect, interviewController.completeInterview);

// Route 6: Generate audio feedback
router.post('/generate-audio-feedback', protect,interviewController.generateAudioFeedback);

// Route 7: Get interview session details
router.get('/session/:sessionId',protect, interviewController.getSession);

// Route 8: Get all user interviews
router.get('/user/history',protect, interviewController.getUserInterviews);

// Route 9: Cancel interview
router.post('/cancel/:sessionId',protect, interviewController.cancelInterview);

module.exports = router;