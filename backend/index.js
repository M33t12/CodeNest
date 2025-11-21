// backend/index.js

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
const dotenv = require("dotenv")

const { connectDB } = require("./config/db.js")
const sanitizeInput = require("./middlewares/sanitizeMiddleware.js") // <-- New Import

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// =============================================================================
// I. CORE MIDDLEWARE & SECURITY SETUP
// =============================================================================

// 1. Basic Security Headers (Must be FIRST)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  next()
})

// 2. Cookie Parser
app.use(cookieParser())

// 3. CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-auth-token",]
}))

// 4. Compression Middleware
if (compression) {
  app.use(compression())
}

// 5. Request Logging
if (process.env.NODE_ENV === "development" && morgan) {
  app.use(morgan("dev"))
} else if (morgan) {
  app.use(morgan("combined"))
}

// 6. Body Parsing Middleware (Enhanced limits for file uploads)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// 7. Input Sanitization (Moved to dedicated file)
app.use(sanitizeInput)

// =============================================================================
// II. STATIC FILE SERVING
// =============================================================================

// Serve static files from uploads directory (Must align with multer config)
const baseDir = path.join(__dirname, "..");
app.use('/uploads', express.static(path.join(baseDir, 'uploads'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Content-Type', 'image/*');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// =============================================================================
// III. DATABASE CONNECTION
// =============================================================================

connectDB(process.env.MONGODB_URI)

// =============================================================================
// IV. ROUTE IMPORTS
// =============================================================================

let authRoutes, userRoutes, resourceRoutes, adminRoutes, quizRoutes, interviewRoutes, problemRoutes , progressRoutes;

const loadRoutes = (path) => {
  try {
    const routes = require(path)
    console.log(`✅ ${path} loaded`)
    return routes
  } catch (error) {
    console.error(`❌ Failed to load ${path}:`, error.message)
    return null
  }
}

authRoutes = loadRoutes("./routes/authRoutes")
userRoutes = loadRoutes("./routes/userRoutes")
resourceRoutes = loadRoutes("./routes/resourceRoutes")
adminRoutes = loadRoutes("./routes/adminRoutes")
quizRoutes = loadRoutes("./routes/quizRoutes")
interviewRoutes = loadRoutes("./routes/interviewRoutes")
problemRoutes = loadRoutes("./routes/problemRoutes")
progressRoutes = loadRoutes("./routes/progressRoutes")

// =============================================================================
// V. API ROUTES & STATUS ENDPOINTS
// =============================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "2.1.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    fileStorage: "local-multer",
    aiService: process.env.GROQ_API_KEY ? "groq-available" : "groq-unavailable"
  })
})

// API status endpoint
app.get("/api/status", (req, res) => {
  const loadedRoutes = {}
  if (authRoutes) loadedRoutes.auth = "/api/auth"
  if (userRoutes) loadedRoutes.users = "/api/users"
  if (resourceRoutes) loadedRoutes.resources = "/api/resources"
  if (adminRoutes) loadedRoutes.admin = "/api/admin"
  if (quizRoutes) loadedRoutes.admin = "/api/quiz"
  if (interviewRoutes) loadedRoutes.users = "/api/interview"
  if (problemRoutes) loadedRoutes.users = "/api/dsa-problem"
  if (progressRoutes) loadRoutes.users = "/api/dsa-progress"
 
  res.json({
    message: "Resource Management API v2.1 is running",
    version: "2.1.0",
    features: [
      "JWT Authentication",
      "AI Content Moderation (Groq)",
      "File Upload (Local Multer) ✅",
      "Role-based Access Control",
      "Advanced Resource Management with AI Verification",
      "Static File Serving",
      "Ai Based Quiz Generation"
    ],
    endpoints: loadedRoutes,
    uploadSupport: {
      pdfs: "✅ Up to 16MB",
      images: "✅ Up to 8MB", 
      storage: "Local filesystem",
      staticUrl: "/uploads/"
    },
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    },
    aiModeration: {
      service: "Groq",
      status: process.env.GROQ_API_KEY ? "configured" : "missing-api-key",
      capabilities: ["Content Analysis", "Educational Relevance", "Safety Check"]
    }
  })
})

// Mount API routes
if (authRoutes) app.use("/api/auth", authRoutes)
if (userRoutes) app.use("/api/users", userRoutes)
if (resourceRoutes) app.use("/api/resources", resourceRoutes)
if (adminRoutes) app.use("/api/admin", adminRoutes)
if (quizRoutes) app.use("/api/quiz",quizRoutes)
if (interviewRoutes) app.use("/api/interview",interviewRoutes)
if (problemRoutes) app.use("/api/dsa-problem" , problemRoutes)
if (progressRoutes) app.use("/api/dsa-progress" , progressRoutes)

// =============================================================================
// VI. ERROR HANDLING MIDDLEWARE
// =============================================================================

// 404 Handler (Catch-all for undefined routes)
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: "/api/status",
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("💥 Global Error Handler:", {
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  })

  // Handle Multer specific errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ 
      message: "File too large", 
      maxSize: error.field === 'pdf' ? "16MB" : "8MB",
      field: error.field
    })
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ 
      message: "Unexpected file field", 
      expectedField: "file" 
    })
  }

  if (error.message && error.message.includes('Only') && error.message.includes('files are allowed')) {
    return res.status(400).json({ 
      message: "Invalid file type", 
      details: error.message 
    })
  }

  // Handle Mongoose/DB Errors
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }))
    return res.status(400).json({ message: "Validation Error", errors: validationErrors })
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format", field: error.path, value: error.value })
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(409).json({ message: `Duplicate value for ${field}`, field, value: error.keyValue[field] })
  }

  if (error.name === "MongoNetworkError") {
    return res.status(503).json({ message: "Database connection error" })
  }

  // Handle Auth Errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" })
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired", expiredAt: error.expiredAt })
  }

  // Default Fallback
  res.status(error.statusCode || error.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

// =============================================================================
// VII. GRACEFUL SHUTDOWN & SERVER STARTUP
// =============================================================================

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)
  server.close(() => {
    console.log("HTTP server closed.")
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed.")
      console.log("Graceful shutdown complete.")
      process.exit(0)
    })
  })
  setTimeout(() => process.exit(1), 30000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
  gracefulShutdown("UNCAUGHT_EXCEPTION")
})
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  gracefulShutdown("UNHANDLED_REJECTION")
})

const server = app.listen(PORT, () => {
  console.log(`
🚀 Resource Management Server v2.1 Started
📱 Environment: ${process.env.NODE_ENV || "development"}
🌐 Port: ${PORT}
🔗 Local URL: http://localhost:${PORT}
📚 API Status: http://localhost:${PORT}/api/status
💡 Health Check: http://localhost:${PORT}/health
📁 Static Files: http://localhost:${PORT}/uploads/
  `)

  if (process.env.NODE_ENV === "development") {
    console.log("📋 Available API Routes:")
    if (authRoutes) console.log("   🔐 Auth: /api/auth")
    if (userRoutes) console.log("   👤 Users: /api/users")
    if (resourceRoutes) console.log("   📄 Resources: /api/resources")
    if (adminRoutes) console.log("   👨‍💼 Admin: /api/admin")
    if (quizRoutes) console.log("   📄 Quiz : /api/quiz")
    if (interviewRoutes) console.log("   💼  Interview : /api/interview")
    if (problemRoutes) console.log ("   🧩 DSA Problem : /api/dsa-problem")
    if (progressRoutes) console.log("   📊 DSA Progress : /api/dsa-progress")
    console.log("   📁 Static Files: /uploads/")
    console.log("")
    
    console.log("📤 File Upload Support:")
    console.log("   PDFs: Up to 16MB → /uploads/pdfs/")
    console.log("   Images: Up to 8MB → /uploads/images/")
    console.log("   Profile Images: Up to 5MB → /uploads/profiles/")
    console.log("")

    if (process.env.GROQ_API_KEY) {
      console.log("🤖 AI Moderation: Groq API configured ✅")
    } else {
      console.log("🤖 AI Moderation: Missing GROQ_API_KEY ❌")
      console.log("   Set GROQ_API_KEY environment variable for AI features")
    }
  }
})

module.exports = { app, server }