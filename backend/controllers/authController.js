// backend/controllers/authController.js
const User = require("../models/User.js");
const setAuthCookie = require("../utils/setAuthCookie.js");

// @desc Register a new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ firstName, lastName, email, password });

    if (user) {
      setAuthCookie(res, user._id);

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("ERROR :: authController :: registerUser ::", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Authenticate user & get token
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // NOTE: Using status 401 (Unauthorized) or 400 (Bad Request) is often better here
      // to avoid leaking information about which users exist.
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user && (await user.matchPassword(password))) {
      user.lastLoginAt = new Date();
      await user.save();

      setAuthCookie(res, user._id);

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      console.log("ERROR :: authController :: loginUser :: Invalid credentials ::");
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("ERROR :: authController :: loginUser ::", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Logout user / clear cookie
// @route POST /api/auth/logout
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};