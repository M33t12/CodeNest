// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware.js");

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController.js");

// NOTE: The original file had a commented-out/unused import for User and verifyClerkJWT.
// Since they aren't used directly in the routes or logic (the logic uses req.user), I'll omit them here for cleanliness.

// @route GET /api/users/profile
// @access Private (via protect middleware)
router.get("/profile", protect, getUserProfile);

// @route PUT /api/users/profile
// @access Private (via protect middleware)
router.put("/profile", protect, updateUserProfile);

module.exports = router;