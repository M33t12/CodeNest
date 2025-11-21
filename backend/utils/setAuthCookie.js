// backend/utils/setAuthCookie.js
const jwt = require("jsonwebtoken");

function setAuthCookie(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,   // HTTPS in production only
    sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in prod, "lax" for dev
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/", // Ensure cookie is available for all paths
  });

  console.log(`Auth cookie set for user ${userId}:`, {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    httpOnly: true,
    maxAge: "30 days"
  });

  return token;
}

module.exports = setAuthCookie;