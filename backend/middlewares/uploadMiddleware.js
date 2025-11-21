const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base project directory (adjust if needed)
const baseDir = path.join(__dirname, "../..");

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    path.join(baseDir, "uploads"),
    path.join(baseDir, "uploads/pdfs"),
    path.join(baseDir, "uploads/images"),
    path.join(baseDir, "uploads/profiles"),
    path.join(baseDir, "uploads/temp"),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// Generic storage (temporary folder)
const uploadAny = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(baseDir, "uploads/temp"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB cap
});

// Middleware to handle file based on type
// REPLACE the entire uploadResource function:
const uploadResource = (req, res, next) => {
  // Use .any() to accept multiple files with different field names
  uploadAny.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: "File upload failed",
        error: err.message,
      });
    }

    // No resourceItems means no files needed
    if (!req.body.resourceItems) {
      return next();
    }

    let resourceItems;
    try {
      resourceItems = typeof req.body.resourceItems === 'string' 
        ? JSON.parse(req.body.resourceItems) 
        : req.body.resourceItems;
    } catch (err) {
      return res.status(400).json({ 
        message: "Invalid resourceItems format" 
      });
    }

    // Organize files by their field names (file_0, file_1, etc.)
    const organizedFiles = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        const fieldName = file.fieldname; // e.g., "file_0", "file_1"
        if (!organizedFiles[fieldName]) {
          organizedFiles[fieldName] = [];
        }
        organizedFiles[fieldName].push(file);
      });
    }
    req.files = organizedFiles;

    // Validate and move files to appropriate directories
    for (let i = 0; i < resourceItems.length; i++) {
      const item = resourceItems[i];
      const fileArray = organizedFiles[`file_${i}`];
      
      if (!fileArray || fileArray.length === 0) continue;
      
      const file = fileArray[0];
      const itemType = item.itemType;

      if (itemType === "pdf") {
        if (file.mimetype !== "application/pdf") {
          return res.status(400).json({ 
            message: `Item ${i + 1}: Only PDF files are allowed` 
          });
        }
        const newPath = path.join(baseDir, "uploads/pdfs", file.filename);
        fs.renameSync(file.path, newPath);
        file.path = newPath;
      }

      if (itemType === "image") {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            message: `Item ${i + 1}: Only image files allowed` 
          });
        }
        const newPath = path.join(baseDir, "uploads/images", file.filename);
        fs.renameSync(file.path, newPath);
        file.path = newPath;
      }
    }

    next();
  });
};

// Cleanup function
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        reject(err);
      } else {
        console.log("File deleted:", filePath);
        resolve();
      }
    });
  });
};

// File info
const getFileInfo = (file) => {
  if (!file) return null;
  const stats = fs.statSync(file.path);
  const fileUrl = `/uploads/${path.relative(path.join(baseDir, "uploads"), file.path).replace(/\\/g, "/")}`;
  return {
    fileName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    fileSize: file.size,
    url: fileUrl,
    path: file.path,
    uploadedAt: stats.birthtime,
  };
};

module.exports = {
  uploadResource,
  deleteFile,
  getFileInfo,
};
