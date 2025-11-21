// backend/routes/resourceRoutes.js

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware.js");
const { uploadResource } = require("../middlewares/uploadMiddleware");

const {
  getApprovedResources,
  createResource,
  getResourceByIdOrSlug,
  updateResource,
  deleteResource,
  downloadResource,
  getMyResources,
  rateResource,
  getFeaturedResources,
  getPopularResources,
} = require("../controllers/resourceController");

// Public: Get all approved resources with advanced filtering
router.get("/", getApprovedResources);

// Protected: Get user's own resources list
router.get("/me/list", protect, getMyResources);

// Public: Get featured resources
router.get("/featured/list", getFeaturedResources);

// Public: Get resource analytics (popular, trending, etc.)
router.get("/analytics/popular", getPopularResources);

// Protected: Upload new resource (with file upload middleware)
router.post("/", protect, uploadResource, createResource);

// Public: Get single resource by ID or slug (must be after /me/list and /featured/list to avoid conflict)
router.get("/:idOrSlug", getResourceByIdOrSlug);

// Protected: Update own resource (with file upload middleware)
router.put("/:id", protect, uploadResource, updateResource);

// Protected: Delete own resource
router.delete("/:id", protect, deleteResource);

// Public: Download/view resource (increment download count)
router.post("/:id/download", downloadResource);

// Protected: Rate a resource
router.post("/:id/rate", protect, rateResource);

module.exports = router;