// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect Middleware
const protect = async (req, res, next) => {
  const token = req.cookies.token; // get JWT from httpOnly cookie
  console.log("Token in protect Route ::", token);
  if (!token) {
    console.log("ERROR :: PROTECT Middleware :: Token not found");
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    console.log("ERROR :: authMiddleware ::PROTECT Middleware :: Error",err);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin accessibilty check by middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { protect, admin };
