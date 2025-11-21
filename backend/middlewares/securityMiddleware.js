// middlewares/securityMiddleware.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => 
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

// Strict rate limiting for auth routes
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 login attempts per windowMs
  'Too many authentication attempts, please try again later'
);

// Upload rate limiting
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 uploads per hour
  'Upload limit exceeded, please try again later'
);

// Admin route rate limiting
const adminLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  50, // limit admin operations
  'Too many admin requests, please try again later'
);

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// Request sanitization
const sanitizeInput = (req, res, next) => {
  // Remove potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// File upload validation
const validateFileUpload = (req, res, next) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (req.file) {
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only PDF and image files are allowed.'
      });
    }

    const maxFileSize = 16 * 1024 * 1024; // 16MB
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 16MB.'
      });
    }
  }

  next();
};

// Admin action logging
const logAdminAction = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    const action = {
      admin: req.user._id,
      adminEmail: req.user.email,
      action: `${req.method} ${req.path}`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      body: req.method !== 'GET' ? req.body : undefined
    };
    
    console.log('Admin Action:', JSON.stringify(action, null, 2));
    // TODO: Store in database or external logging service
  }
  next();
};

// Resource access control
const checkResourceAccess = async (req, res, next) => {
  try {
    const resourceId = req.params.id || req.params.idOrSlug;
    if (!resourceId) return next();

    const Resource = require('../models/Resource');
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user can access this resource
    const canAccess = 
      resource.status === 'approved' || // Public access for approved
      (req.user && resource.uploadedBy.toString() === req.user._id.toString()) || // Owner access
      (req.user && req.user.role === 'admin'); // Admin access

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.resource = resource;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  adminLimiter,
  securityHeaders,
  sanitizeInput,
  validateFileUpload,
  logAdminAction,
  checkResourceAccess
};