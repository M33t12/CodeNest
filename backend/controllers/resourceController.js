// backend/controllers/resourceController.js
const Resource = require("../models/Resource");
const { getFileInfo, deleteFile } = require("../middlewares/uploadMiddleware");

// @desc Get all approved resources with advanced filtering
// @route GET /api/resources
const getApprovedResources = async (req, res) => {
  try {
    const {
      subject,
      type,
      tags,
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const filter = { status: "approved" };

    // Apply filters
    if (subject && subject !== "all") filter.subject = subject;
    if (type && type !== "all") filter.type = type;
    if (tags) filter.tags = { $in: tags.split(",").map((t) => t.trim()) };
    if (featured === "true") filter.isFeatured = true;

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "content.description": { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting options
    const sortOptions = {};
    const validSorts = [
      "createdAt",
      "averageRating",
      "views",
      "downloads",
      "name",
    ];
    if (validSorts.includes(sort)) {
      sortOptions[sort] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "firstName lastName profile.profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-aiFeedback -aiIssues"); // Hide AI details from public

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log(
      "ERROR :: resourceController :: getApprovedResources ::",
      error
    );
    res.status(500).json({ message: "Error fetching resources", error });
  }
};


const createResource = async (req, res) => {
  try {
    let { name, subject, tags = [], version = "1.0" } = req.body;
    
    // Parse resourceItems from request
    let resourceItems = [];
    if (req.body.resourceItems) {
      try {
        resourceItems = typeof req.body.resourceItems === 'string' 
          ? JSON.parse(req.body.resourceItems) 
          : req.body.resourceItems;
      } catch (err) {
        return res.status(400).json({
          message: "Invalid resourceItems format",
          errors: [err.message],
        });
      }
    }

    console.log("Resource creation request:", {
      name,
      subject,
      hasFile: !!req.file,
      resourceItemsCount: resourceItems.length
    });

    // 1. Validate required fields
    if (!name || !subject || !resourceItems || resourceItems.length === 0) {
      return res.status(400).json({ 
        message: "Name, subject, and at least one resource item are required" 
      });
    }

    // 2. Process each resource item
    const validationErrors = [];
    const processedItems = [];

    for (let i = 0; i < resourceItems.length; i++) {
      const item = resourceItems[i];
      let itemContent = {};

      if (typeof item.content === 'string') {
        try {
          itemContent = JSON.parse(item.content);
        } catch (err) {
          validationErrors.push(`Item ${i + 1}: Invalid content JSON`);
          continue;
        }
      } else {
        itemContent = { ...item.content };
      }

      // Validate based on item type
      switch (item.itemType) {
        case "pdf":
        case "image":
          // File validation will be handled separately for multi-file upload
          if (!itemContent.url && !req.files?.[`file_${i}`]) {
            validationErrors.push(`Item ${i + 1}: ${item.itemType} requires a file or URL`);
          }
          
          if (req.files?.[`file_${i}`]) {
            const fileInfo = getFileInfo(req.files[`file_${i}`][0]);
            itemContent = {
              ...itemContent,
              url: fileInfo.url,
              fileName: fileInfo.fileName,
              storedName: fileInfo.storedName,
              fileSize: fileInfo.fileSize,
              mimeType: fileInfo.mimeType,
              filePath: fileInfo.path,
            };
            
            if (item.itemType === "pdf") itemContent.pages = null;
            if (item.itemType === "image") {
              itemContent.width = null;
              itemContent.height = null;
            }
          }
          break;

        case "blog":
        case "markdown":
          if (!itemContent.text || itemContent.text.trim().length < 50) {
            validationErrors.push(
              `Item ${i + 1}: ${item.itemType} requires text with at least 50 characters`
            );
          }
          break;

        case "link":
          if (!itemContent.url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(itemContent.url)) {
            validationErrors.push(`Item ${i + 1}: Link requires a valid HTTP/HTTPS URL`);
          }
          itemContent.description = itemContent.description || "";
          break;

        default:
          validationErrors.push(`Item ${i + 1}: Unsupported resource type: ${item.itemType}`);
          break;
      }

      processedItems.push({
        itemType: item.itemType,
        content: itemContent,
        order: item.order || i
      });
    }

    if (validationErrors.length > 0) {
      // Clean up uploaded files if validation failed
      if (req.files) {
        for (const fileArray of Object.values(req.files)) {
          for (const file of fileArray) {
            try {
              await deleteFile(file.path);
            } catch (cleanupError) {
              console.error("Error cleaning up uploaded file:", cleanupError);
            }
          }
        }
      }
      
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    // 3. Process tags
    const processedTags = Array.isArray(tags) ? tags.filter((t) => t && t.trim()) : [];

    // 4. Determine primary type
    const types = processedItems.map(item => item.itemType);
    const primaryType = types.length === 1 ? types[0] : 'mixed';

    // 5. Create resource
    const resource = new Resource({
      name: name.trim(),
      subject,
      primaryType,
      tags: processedTags,
      resourceItems: processedItems,
      version,
      uploadedBy: req.user._id,
      status: "pending",
      aiVerdict: "unknown",
      aiConfidence: 0,
      aiFeedback: null,
      aiIssues: [],
      aiAnalyzedAt: null,
    });

    await resource.save();

    // 6. Update user's uploaded resources
    req.user.resourcesUploaded.push(resource._id);
    await req.user.save();

    console.log("Multi-item resource created:", resource._id);

    // 7. Return populated resource
    const populatedResource = await Resource.findById(resource._id).populate(
      "uploadedBy",
      "firstName lastName"
    );

    res.status(201).json({
      resource: populatedResource,
      message: "Resource uploaded successfully and is awaiting admin review.",
      note: "AI analysis will be performed when triggered by an admin.",
    });
  } catch (error) {
    // Clean up uploaded files if resource creation fails
    if (req.files) {
      for (const fileArray of Object.values(req.files)) {
        for (const file of fileArray) {
          try {
            await deleteFile(file.path);
          } catch (cleanupError) {
            console.error("Error cleaning up after creation failure:", cleanupError);
          }
        }
      }
    }
    console.error("Resource creation error:", error);
    res.status(500).json({ message: "Error creating resource", error: error.message });
  }
};


// @desc Get single resource by ID or slug
// @route GET /api/resources/:idOrSlug
const getResourceByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug, status: "approved" }
      : { slug: idOrSlug, status: "approved" };

    const resource = await Resource.findOne(query)
      .populate("uploadedBy", "firstName lastName profile")
      .populate("approvedBy", "firstName lastName")
      .populate("ratings.userId", "firstName lastName");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Increment view count
    resource.views = (resource.views || 0) + 1;
    await resource.save();

    // Get similar resources
    const similar = await Resource.findSimilar(
      resource._id,
      resource.subject,
      resource.tags,
      4
    );

    res.json({ resource, similar });
  } catch (error) {
    console.log(
      "ERROR :: resourceController :: getResourceByIdOrSlug ::",
      error
    );
    res.status(500).json({ message: "Error fetching resource", error });
  }
};

// @desc Update own resource (only if pending)
// @route PUT /api/resources/:id
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!resource.isEditable()) {
      return res.status(403).json({
        message: "Only pending resources can be edited",
      });
    }

    // NEW: Parse resourceItems if updating multi-item resource
    let resourceItems = [];
    if (req.body.resourceItems) {
      try {
        resourceItems = typeof req.body.resourceItems === 'string' 
          ? JSON.parse(req.body.resourceItems) 
          : req.body.resourceItems;
      } catch (err) {
        return res.status(400).json({
          message: "Invalid resourceItems format",
          errors: [err.message],
        });
      }
    }

    const updates = req.body;

    // NEW: Handle multi-file updates
    if (req.files && Object.keys(req.files).length > 0) {
      // Process each file for multi-item resources
      for (let i = 0; i < resourceItems.length; i++) {
        const fileArray = req.files[`file_${i}`];
        if (fileArray && fileArray[0]) {
          const fileInfo = getFileInfo(fileArray[0]);
          
          // Update the specific item's content
          if (!resourceItems[i].content) resourceItems[i].content = {};
          Object.assign(resourceItems[i].content, fileInfo);
        }
      }
      updates.resourceItems = resourceItems;
    } else if (req.file) {
      // Delete old file if exists
      if (resource.content.filePath) {
        try {
          await deleteFile(resource.content.filePath);
        } catch (err) {
          console.error("Error deleting old file:", err);
        }
      }

      // Add new file info
      const fileInfo = getFileInfo(req.file);
      updates.content = {
        ...updates.content,
        ...fileInfo,
      };
    }

    // Save previous version
    if (resource.content) {
      resource.previousVersions.push({
        version: resource.version,
        content: resource.content,
        updatedAt: new Date(),
        reason: updates.updateReason || "User update",
      });
    }

    // Update fields
    Object.assign(resource, updates);

    // Reset AI analysis fields when resource is updated
    resource.aiVerdict = "unknown";
    resource.aiConfidence = 0;
    resource.aiFeedback = null;
    resource.aiIssues = [];
    resource.aiAnalyzedAt = null;

    await resource.save();

    res.json({
      resource,
      message:
        "Resource updated successfully. AI analysis will be performed when triggered by an admin.",
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await deleteFile(req.file.path);
      } catch (cleanupError) {
        console.error(
          "Error cleaning up uploaded file after update failure:",
          cleanupError
        );
      }
    }

    res.status(500).json({ message: "Error updating resource", error });
  }
};

// @desc Delete own resource (only if pending)
// @route DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!resource.isEditable()) {
      return res.status(403).json({
        message: "Only pending resources can be deleted",
      });
    }

    // Delete associated file if exists
    // NEW: Delete all associated files (multi-item support)
    if (resource.resourceItems && resource.resourceItems.length > 0) {
      // Multi-item resource - delete all files
      for (const item of resource.resourceItems) {
        if (item.content?.filePath) {
          try {
            await deleteFile(item.content.filePath);
            console.log("Associated file deleted:", item.content.filePath);
          } catch (err) {
            console.error("Error deleting associated file:", err);
          }
        }
      }
    } else if (resource.content?.filePath) {
      // OLD: Single-item resource (backward compatibility)
      try {
        await deleteFile(resource.content.filePath);
        console.log("Associated file deleted:", resource.content.filePath);
      } catch (err) {
        console.error("Error deleting associated file:", err);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    // Remove from user's uploaded resources
    req.user.resourcesUploaded.pull(req.params.id);
    await req.user.save();

    res.json({ message: "Resource and associated files deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting resource", error });
  }
};

// @desc Download/view resource (increment download count)
// @route POST /api/resources/:id/download
const downloadResource = async (req, res) => {
  try {
    const { itemIndex } = req.query; // NEW: Optional item index for multi-item resources
    
    const resource = await Resource.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Increment download count
    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    // NEW: Handle multi-item resources
    if (resource.resourceItems && resource.resourceItems.length > 0) {
      if (itemIndex !== undefined) {
        const index = parseInt(itemIndex);
        if (index >= 0 && index < resource.resourceItems.length) {
          return res.json({
            success: true,
            downloadUrl: resource.resourceItems[index].content?.url,
            downloads: resource.downloads,
            itemType: resource.resourceItems[index].itemType,
            itemIndex: index
          });
        } else {
          return res.status(400).json({ message: "Invalid item index" });
        }
      }
      
      // Return all items if no specific index requested
      return res.json({
        success: true,
        items: resource.resourceItems.map((item, idx) => ({
          index: idx,
          type: item.itemType,
          downloadUrl: item.content?.url,
          fileName: item.content?.fileName
        })),
        downloads: resource.downloads,
      });
    } else {
      // OLD: Single-item resource (backward compatibility)
      res.json({
        success: true,
        downloadUrl: resource.content?.url,
        downloads: resource.downloads,
      });
    }
  } catch (error) {
    console.log("ERROR :: resourceController :: downloadResource ::", error);
    res.status(500).json({ message: "Error processing download", error });
  }
};

// @desc Get user's own resources
// @route GET /api/resources/me/list
const getMyResources = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { uploadedBy: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "name type status slug subject createdAt rejectionReason aiFeedback aiVerdict aiAnalyzedAt views downloads averageRating"
      );

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.log("ERROR :: resourceController :: getMyResources ::", error);
    res.status(500).json({ message: "Error fetching your resources", error });
  }
};

// @desc Rate a resource
// @route POST /api/resources/:id/rate
const rateResource = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const resource = await Resource.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Prevent rating own resource
    if (resource.uploadedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: "Cannot rate your own resource",
      });
    }

    // Remove previous rating by same user
    resource.ratings = resource.ratings.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );

    // Add new rating
    resource.ratings.push({
      userId: req.user._id,
      rating: Number(rating),
      review: review || "",
    });

    await resource.save();

    const updatedResource = await Resource.findById(req.params.id)
      .populate("ratings.userId", "firstName lastName")
      .select("averageRating totalRatings ratings");

    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: "Error rating resource", error });
  }
};

// @desc Get featured resources
// @route GET /api/resources/featured/list
const getFeaturedResources = async (req, res) => {
  try {
    const featured = await Resource.find({
      status: "approved",
      isFeatured: true,
    })
      .populate("uploadedBy", "firstName lastName")
      .sort({ featuredAt: -1 })
      .limit(6);

    res.json(featured);
  } catch (error) {
    console.log(
      "ERROR :: resourceController :: getFeaturedResources ::",
      error
    );
    res
      .status(500)
      .json({ message: "Error fetching featured resources", error });
  }
};

// @desc Get resource analytics (popular, trending, etc.)
// @route GET /api/resources/analytics/popular
const getPopularResources = async (req, res) => {
  try {
    const { timeframe = "30", limit = 10 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const popular = await Resource.find({
      status: "approved",
      createdAt: { $gte: daysAgo },
    })
      .populate("uploadedBy", "firstName lastName")
      .sort({ views: -1, averageRating: -1 })
      .limit(parseInt(limit));

    res.json(popular);
  } catch (error) {
    console.log("ERROR :: resourceController :: getPopularResources ::", error);
    res
      .status(500)
      .json({ message: "Error fetching popular resources", error });
  }
};

module.exports = {
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
};
