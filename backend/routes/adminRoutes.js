// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middlewares/authMiddleware.js');

// Import User Management Controllers
const {
  getDashboardOverview,
  getAllUsers,
  getSingleUserDetails,
  blockUser,
  unblockUser,
  promoteUser,
  demoteUser,
  deleteUser,
  getSystemActivities,
} = require('../controllers/admin/userController.js');

// Import Resource and Moderation Controllers
const {
  getAllResourcesForAdmin,
  getPendingResources,
  analyzeResource,
  reanalyzeResourceHandler,
  batchAnalyzeResources,
  getAnalysisQueueStatus,
  approveResource,
  rejectResource,
  bulkDeleteResources,
  getAnalyticsAndReports,
  getAiModerationAnalytics,
  deleteResource,
  getGroqStatus
} = require('../controllers/admin/resourceController.js');

// Apply protect and admin middleware to all admin routes
router.use(protect, admin);

// =============================================================================
// 1. DASHBOARD & ANALYTICS
// =============================================================================

// Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// General Analytics & Reports (User/Resource Trends)
router.get('/analytics', getAnalyticsAndReports);

// AI Moderation Analytics
router.get('/analytics/ai-moderation', getAiModerationAnalytics);

// System Activities Log
router.get('/activities', getSystemActivities);

// =============================================================================
// 2. USER MANAGEMENT
// =============================================================================

// Get All Users
router.get('/users', getAllUsers);

// Get Single User Details
router.get('/users/:userId', getSingleUserDetails);

// Block/Unblock User
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);

// Promote/Demote User
router.put('/users/:userId/promote', promoteUser);
router.put('/users/:userId/demote', demoteUser);

// Delete User
router.delete('/users/:userId', deleteUser);

// =============================================================================
// 3. RESOURCE & AI MODERATION MANAGEMENT
// =============================================================================

// Get All Resources (with general/AI filters)
router.get('/resources', getAllResourcesForAdmin);

// Get Pending Resources (categorized by AI status)
router.get('/resources/pending', getPendingResources);

// AI Analysis Queue Status
router.get('/resources/analysis-queue', getAnalysisQueueStatus);

// Trigger Single AI Analysis
router.post('/resources/:id/analyze', analyzeResource);

// Trigger Single AI Re-Analysis
router.post('/resources/:id/reanalyze', reanalyzeResourceHandler);

// Batch Analyze Resources
router.post('/resources/batch-analyze', batchAnalyzeResources);

// Approve/Reject Resource
router.put('/resources/:id/approve', approveResource);
router.put('/resources/:id/reject', rejectResource);

router.delete('/resources/:id',deleteResource);
router.delete('/resources/bulk-delete',bulkDeleteResources);
router.get('/groq/status', protect, admin, getGroqStatus);


module.exports = router;