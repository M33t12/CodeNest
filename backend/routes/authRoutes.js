// backend/routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

// @route POST /api/auth/register
router.post("/register", registerUser);

// @route POST /api/auth/login
router.post("/login", loginUser);

// @route POST /api/auth/logout
router.post("/logout", logoutUser);

module.exports = router;