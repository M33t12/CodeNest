// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect  } = require('../middlewares/authMiddleware');

router.get('/:userId/stats', protect, progressController.getProgressStats);
router.get('/:userId', protect, progressController.getUserProgress);
router.put('/:userId/:problemId', protect, progressController.updateProgress);

module.exports = router;
