// backend/middlewares/sanitizeMiddleware.js

// Function to perform basic sanitization on a string
const sanitizeString = (str) => {
  if (typeof str !== "string") return str
  // Remove script tags, javascript: URLs, and on-event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
}

// Function to recursively sanitize properties of an object (body, query, params)
const sanitizeObject = (obj) => {
  if (obj && typeof obj === "object") {
    // Check if it's an array and iterate through it
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            if (typeof item === "string") {
                obj[index] = sanitizeString(item)
            } else if (typeof item === "object" && item !== null) {
                sanitizeObject(item)
            }
        })
    } else {
        // Handle object properties
        for (const key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = sanitizeString(obj[key])
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                sanitizeObject(obj[key])
            }
        }
    }
  }
  return obj
}

// Express middleware function
const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body)
  if (req.query) req.query = sanitizeObject(req.query)
  if (req.params) req.params = sanitizeObject(req.params)

  next()
}

module.exports = sanitizeInput;