// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { protect , admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', problemController.getProblems);
router.get('/topics', problemController.getTopics);
router.get('/statistics', problemController.getStatistics);
router.get('/:slug', problemController.getProblemBySlug);

// Admin routes (add authentication middleware)
router.post('/sync', protect , admin , problemController.syncProblems);

module.exports = router;