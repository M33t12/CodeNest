// backend/controllers/admin/resourceController.js

const Resource = require("../../models/Resource.js");
const User = require("../../models/User.js");
const { deleteFile } = require("../../middlewares/uploadMiddleware.js");
const {
  moderateResource,
  reanalyzeResource,
  checkGroqLimits,
} = require("../../services/aiModeration.js"); // Assuming path

// @desc Resource Management - Get All Resources for Admin Review
// @route GET /api/admin/resources (Enhanced filtering)
const getAllResourcesForAdmin = async (req, res) => {
  try {
    const {
      status,
      type,
      subject,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      aiVerdict,
      minConfidence,
      aiStatus, // 'analyzed', 'awaiting', 'all'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (subject) filter.subject = subject;
    if (aiVerdict && aiVerdict !== "all") filter.aiVerdict = aiVerdict;
    if (minConfidence)
      filter.aiConfidence = { $gte: parseFloat(minConfidence) };

    // Filter by AI analysis status
    if (aiStatus === "analyzed") {
      filter.aiAnalyzedAt = { $exists: true, $ne: null };
      filter.aiVerdict = { $ne: "unknown" };
    } else if (aiStatus === "awaiting") {
      filter.$or = [
        { aiAnalyzedAt: { $exists: false } },
        { aiAnalyzedAt: null },
        { aiVerdict: "unknown" },
      ];
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "content.description": { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "firstName lastName email")
      .populate("approvedBy", "firstName lastName")
      .populate("aiAnalyzedBy", "firstName lastName")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(filter);

    const statusCounts = await Resource.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const aiStatusCounts = {
      awaiting: await Resource.countDocuments({
        $or: [
          { aiAnalyzedAt: { $exists: false } },
          { aiAnalyzedAt: null },
          { aiVerdict: "unknown" },
        ],
      }),
      analyzed: await Resource.countDocuments({
        aiAnalyzedAt: { $exists: true, $ne: null },
        aiVerdict: { $ne: "unknown" },
      }),
    };

    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      aiStatusCounts,
    });
  } catch (error) {
    console.log(
      "ERROR :: resourceController :: getAllResourcesForAdmin ::",
      error
    );
    res.status(500).json({ message: "Error fetching resources", error });
  }
};

// @desc Get pending resources categorized by AI analysis status
// @route GET /api/admin/resources/pending
const getPendingResources = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = "all", // 'awaiting-ai', 'ai-analyzed', 'ready-for-decision'
      aiVerdict,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { status: "pending" };

    // Categorize resources based on AI analysis status
    switch (category) {
      case "awaiting-ai":
        filter.$or = [
          { aiAnalyzedAt: { $exists: false } },
          { aiAnalyzedAt: null },
          { aiVerdict: "unknown" },
        ];
        break;

      case "ai-analyzed":
        filter.aiAnalyzedAt = { $exists: true, $ne: null };
        filter.aiVerdict = { $ne: "unknown" };
        break;

      case "ready-for-decision":
        filter.aiAnalyzedAt = { $exists: true, $ne: null };
        filter.aiVerdict = { $ne: "unknown" };
        if (aiVerdict) {
          filter.aiVerdict = aiVerdict;
        }
        break;

      default: // 'all'
        if (aiVerdict) {
          filter.aiVerdict = aiVerdict;
        }
        break;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "firstName lastName email profile")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(filter);

    // Get category counts
    const categoryCounts = {
      all: await Resource.countDocuments({ status: "pending" }),
      awaitingAi: await Resource.countDocuments({
        status: "pending",
        $or: [
          { aiAnalyzedAt: { $exists: false } },
          { aiAnalyzedAt: null },
          { aiVerdict: "unknown" },
        ],
      }),
      aiAnalyzed: await Resource.countDocuments({
        status: "pending",
        aiAnalyzedAt: { $exists: true, $ne: null },
        aiVerdict: { $ne: "unknown" },
      }),
    };

    categoryCounts.readyForDecision = categoryCounts.aiAnalyzed;

    res.json({
      resources,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
      categoryCounts,
    });
  } catch (error) {
    console.log("ERROR :: resourceController :: getPendingResources ::", error);
    res
      .status(500)
      .json({ message: "Error fetching pending resources", error });
  }
};

// @desc Trigger AI analysis for a specific resource
// @route POST /api/admin/resources/:id/analyze
const analyzeResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.status !== "pending") {
      return res.status(400).json({
        message: "Only pending resources can be analyzed",
        currentStatus: resource.status,
      });
    }

    console.log("Admin triggered AI analysis for resource:", resource._id);

    // **CALL THE AI SERVICE**
    // Analyze all resource items
    const aiResults = [];
    for (const item of resource.resourceItems) {
      const aiResult = await moderateResource({
        type: item.itemType,
        name: resource.name,
        subject: resource.subject,
        content: item.content,
        tags: resource.tags,
      });
      aiResults.push(aiResult);
    }

    // Aggregate AI results
    const aiResult = {
      verdict: aiResults.every((r) => r.verdict === "approve")
        ? "approve"
        : aiResults.some((r) => r.verdict === "reject")
        ? "reject"
        : "neutral",
      confidence:
        aiResults.reduce((sum, r) => sum + r.confidence, 0) / aiResults.length,
      feedback: aiResults
        .map(
          (r, i) =>
            `Item ${i + 1} (${resource.resourceItems[i].itemType}): ${
              r.feedback
            }`
        )
        .join("\n"),
      issues: aiResults.flatMap((r) => r.issues || []),
      recommendations: aiResults.flatMap((r) => r.recommendations || []),
    };

    // Update resource with AI analysis results
    resource.aiFeedback = aiResult.feedback;
    resource.aiVerdict = aiResult.verdict;
    resource.aiConfidence = aiResult.confidence;
    resource.aiIssues = aiResult.issues || [];
    resource.aiAnalyzedAt = new Date();
    resource.aiAnalyzedBy = req.user._id;

    await resource.save();

    await resource.populate("aiAnalyzedBy", "firstName lastName");

    const responseData = {
      resource: resource.toObject(),
      aiAnalysis: {
        verdict: resource.aiVerdict,
        confidence: resource.aiConfidence,
        feedback: resource.aiFeedback,
        issues: resource.aiIssues,
        recommendations: aiResult.recommendations || [],
        analyzedAt: resource.aiAnalyzedAt,
        analyzedBy: resource.aiAnalyzedBy,
        needsAnalysis: false,
        readyForDecision: true,
      },
      message: "Resource analyzed successfully by AI",
      analyzedBy: {
        adminId: req.user._id,
        adminName: req.user.firstName + " " + req.user.lastName,
        timestamp: new Date(),
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("AI analysis error:", error);
    if (error.message && error.message.includes("API key")) {
      return res.status(500).json({
        message: "AI service configuration error",
        error: "Please check API key configuration",
      });
    }
    res.status(500).json({
      message: "Error analyzing resource with AI",
      error: error.message,
    });
  }
};

// @desc Re-analyze resource with updated AI criteria
// @route POST /api/admin/resources/:id/reanalyze
const reanalyzeResourceHandler = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    console.log("Admin triggered re-analysis for resource:", resource._id);

    // **CALL THE AI SERVICE FOR RE-ANALYSIS**
    const aiResult = await reanalyzeResource(resource);
    console.log(
      "Admin::ResourceController :: reanalyze:: resource::AIRESult",
      aiResult
    );

    // Update resource with new AI results
    const previousAnalysis = {
      verdict: resource.aiVerdict,
      confidence: resource.aiConfidence,
      feedback: resource.aiFeedback,
      issues: resource.aiIssues,
      analyzedAt: resource.aiAnalyzedAt,
    };

    resource.aiFeedback = aiResult.feedback;
    resource.aiVerdict = aiResult.verdict;
    resource.aiConfidence = aiResult.confidence;
    resource.aiIssues = aiResult.issues || [];
    resource.aiAnalyzedAt = new Date();
    resource.aiAnalyzedBy = req.user._id;

    // Store previous analysis for comparison
    if (!resource.previousAiAnalyses) {
      resource.previousAiAnalyses = [];
    }
    resource.previousAiAnalyses.push({
      ...previousAnalysis,
      reanalyzedAt: new Date(),
      reanalyzedBy: req.user._id,
    });

    await resource.save();
    await resource.populate("aiAnalyzedBy", "firstName lastName");

    const responseData = {
      resource: resource.toObject(),
      aiAnalysis: {
        verdict: resource.aiVerdict,
        confidence: resource.aiConfidence,
        feedback: resource.aiFeedback,
        issues: resource.aiIssues,
        recommendations: aiResult.recommendations || [],
        analyzedAt: resource.aiAnalyzedAt,
        analyzedBy: resource.aiAnalyzedBy,
        previousAnalysis: previousAnalysis,
        isReanalysis: true,
      },
      message: "Resource re-analyzed successfully",
      reanalyzedBy: {
        adminId: req.user._id,
        adminName: req.user.firstName + " " + req.user.lastName,
        timestamp: new Date(),
      },
    };

    res.json(responseData);
  } catch (error) {
    console.log(
      "ERROR :: resourceController :: reanalyzeResourceHandler ::",
      error
    );
    res
      .status(500)
      .json({ message: "Error re-analyzing resource", error: error.message });
  }
};

// @desc Batch analyze multiple resources
// @route POST /api/admin/resources/batch-analyze
const batchAnalyzeResources = async (req, res) => {
  try {
    const { resourceIds } = req.body;

    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return res.status(400).json({
        message: "resourceIds array is required and cannot be empty",
      });
    }

    if (resourceIds.length > 10) {
      return res.status(400).json({
        message: "Maximum 10 resources can be analyzed at once",
      });
    }

    const results = [];
    const errors = [];

    console.log(`Starting batch analysis for ${resourceIds.length} resources`);

    for (const resourceId of resourceIds) {
      try {
        const resource = await Resource.findById(resourceId);

        if (!resource) {
          errors.push({ resourceId, error: "Resource not found" });
          continue;
        }

        if (resource.status !== "pending") {
          errors.push({
            resourceId,
            error: "Only pending resources can be analyzed",
          });
          continue;
        }

        // Call AI service
        const aiResult = await moderateResource({
          type: resource.type,
          name: resource.name,
          subject: resource.subject,
          content: resource.content,
          tags: resource.tags,
        });

        // Update resource
        resource.aiFeedback = aiResult.feedback;
        resource.aiVerdict = aiResult.verdict;
        resource.aiConfidence = aiResult.confidence;
        resource.aiIssues = aiResult.issues || [];
        resource.aiAnalyzedAt = new Date();
        resource.aiAnalyzedBy = req.user._id;

        await resource.save();

        results.push({
          resourceId: resourceId,
          resourceName: resource.name,
          verdict: aiResult.verdict,
          confidence: aiResult.confidence,
          issues: aiResult.issues?.length || 0,
          success: true,
        });

        // Add delay to avoid overwhelming the AI service
        if (resourceIds.indexOf(resourceId) < resourceIds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 second delay
        }
      } catch (error) {
        console.error(`Error analyzing resource ${resourceId}:`, error);
        errors.push({
          resourceId,
          error: error.message || "Analysis failed",
        });
      }
    }

    const responseData = {
      message: `Batch analysis completed`,
      summary: {
        total: resourceIds.length,
        successful: results.length,
        failed: errors.length,
        processed: results.length + errors.length,
      },
      results: results,
      errors: errors,
      batchAnalyzedBy: {
        adminId: req.user._id,
        adminName: req.user.firstName + " " + req.user.lastName,
        timestamp: new Date(),
      },
    };

    const statusCode = errors.length > 0 ? 207 : 200; // 207 = Multi-Status
    res.status(statusCode).json(responseData);
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({
      message: "Batch analysis failed",
      error: error.message,
    });
  }
};

// @desc Get AI analysis queue status
// @route GET /api/admin/resources/analysis-queue
const getAnalysisQueueStatus = async (req, res) => {
  try {
    const needingAnalysis = await Resource.find({
      status: "pending",
      $or: [
        { aiAnalyzedAt: { $exists: false } },
        { aiAnalyzedAt: null },
        { aiVerdict: "unknown" },
      ],
    })
      .populate("uploadedBy", "firstName lastName email")
      .sort({ createdAt: 1 }) // Oldest first
      .limit(50);

    const readyForDecision = await Resource.find({
      status: "pending",
      aiAnalyzedAt: { $exists: true, $ne: null },
      aiVerdict: { $ne: "unknown" },
    })
      .populate("uploadedBy", "firstName lastName email")
      .populate("aiAnalyzedBy", "firstName lastName")
      .sort({ aiAnalyzedAt: -1 })
      .limit(50);

    res.json({
      needingAnalysis: {
        count: needingAnalysis.length,
        resources: needingAnalysis,
      },
      readyForDecision: {
        count: readyForDecision.length,
        resources: readyForDecision,
      },
      queueStatus: {
        totalPending: needingAnalysis.length + readyForDecision.length,
        awaitingAI: needingAnalysis.length,
        awaitingDecision: readyForDecision.length,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis queue:", error);
    res
      .status(500)
      .json({ message: "Error fetching analysis queue", error: error.message });
  }
};

// @desc Admin approve resource
// @route PUT /api/admin/resources/:id/approve
const approveResource = async (req, res) => {
  try {
    const { adminNotes, overrideAI = false, forceApproval = false } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.status !== "pending") {
      return res.status(400).json({
        message: "Only pending resources can be approved",
        currentStatus: resource.status,
      });
    }

    // Check if AI analysis is completed (unless forced)
    if (
      !forceApproval &&
      (!resource.aiAnalyzedAt || resource.aiVerdict === "unknown")
    ) {
      return res.status(400).json({
        message:
          "Resource must be analyzed by AI before approval. Trigger AI analysis first or use forceApproval flag.",
        aiStatus: {
          analyzed: !!resource.aiAnalyzedAt,
          verdict: resource.aiVerdict || "unknown",
        },
        suggestion:
          "Use POST /api/admin/resources/:id/analyze to run AI analysis first",
      });
    }

    // Check AI verdict before approval (unless overridden)
    if (
      !overrideAI &&
      !forceApproval &&
      resource.aiVerdict === "reject" &&
      resource.aiConfidence > 0.7
    ) {
      return res.status(400).json({
        message:
          "AI analysis recommends rejection with high confidence. Use overrideAI flag to proceed.",
        aiAnalysis: {
          verdict: resource.aiVerdict,
          confidence: resource.aiConfidence,
          feedback: resource.aiFeedback,
          issues: resource.aiIssues,
        },
      });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: undefined,
        adminNotes: adminNotes,
      },
      { new: true }
    )
      .populate("uploadedBy", "firstName lastName email")
      .populate("aiAnalyzedBy", "firstName lastName");

    console.log(
      "Admin :: ResourceController :: Updated Resource ::",
      updatedResource
    );

    const approvalFlags = {
      aiOverride: overrideAI && resource.aiVerdict === "reject",
      forceApproval: forceApproval,
      hadAiAnalysis: !!resource.aiAnalyzedAt,
    };

    res.json({
      resource: updatedResource,
      message: "Resource approved successfully",
      ...approvalFlags,
      approvedBy: {
        adminId: req.user._id,
        adminName: req.user.firstName + " " + req.user.lastName,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.log("ERROR :: resourceController :: approveResource ::", error);
    res.status(500).json({ message: "Error approving resource", error });
  }
};

// @desc Admin reject resource
// @route PUT /api/admin/resources/:id/reject
const rejectResource = async (req, res) => {
  try {
    const { reason, adminNotes, deleteFiles = false } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: "Rejection reason must be at least 10 characters long",
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.status !== "pending") {
      return res.status(400).json({
        message: "Only pending resources can be rejected",
        currentStatus: resource.status,
      });
    }

    // Optionally delete associated files
    if (deleteFiles && resource.content.filePath) {
      try {
        await deleteFile(resource.content.filePath);
        console.log(
          "Associated file deleted during rejection:",
          resource.content.filePath
        );
      } catch (fileError) {
        console.error("Error deleting file during rejection:", fileError);
      }
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: reason.trim(),
        adminNotes: adminNotes,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    )
      .populate("uploadedBy", "firstName lastName email")
      .populate("aiAnalyzedBy", "firstName lastName");

    res.json({
      resource: updatedResource,
      message: "Resource rejected with detailed feedback",
      filesDeleted: deleteFiles,
      rejectedBy: {
        adminId: req.user._id,
        adminName: req.user.firstName + " " + req.user.lastName,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.log("ERROR :: resourceController :: rejectResource ::", error);
    res.status(500).json({ message: "Error rejecting resource", error });
  }
};

// @desc Admin: Permanently delete a resource and its associated files
// @route DELETE /api/admin/resources/:id
const deleteResource = async (req, res) => {
  try {
    const {
      confirmDeletion = true,
      deleteFiles = true,
      reason,
      notifyUser = false,
    } = req.body;

    if (!confirmDeletion) {
      return res.status(400).json({
        message:
          "Deletion must be confirmed by setting 'confirmDeletion' to true",
        warning:
          "This action is irreversible and will permanently delete the resource",
      });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        message:
          "Deletion reason must be provided and at least 10 characters long",
      });
    }

    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "firstName lastName email"
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Store resource data for response before deletion
    const resourceData = {
      id: resource._id,
      name: resource.name,
      type: resource.type,
      subject: resource.subject,
      status: resource.status,
      uploadedBy: resource.uploadedBy,
      createdAt: resource.createdAt,
      fileInfo: resource.content?.fileName
        ? {
            fileName: resource.content.fileName,
            fileSize: resource.content.fileSize,
            filePath: resource.content.filePath,
          }
        : null,
    };

    let fileOperationResults = {
      attempted: false,
      success: false,
      error: null,
    };

    // Delete associated files if requested and file exists
    if (deleteFiles) {
      const fs = require("fs").promises;
      const path = require("path");
      // Handle multi-item resources
      if (resource.resourceItems && resource.resourceItems.length > 0) {
        for (const item of resource.resourceItems) {
          if (item.content?.filePath) {
            try {
              const fullPath = path.resolve(item.content.filePath);
              await fs.access(fullPath);
              await fs.unlink(fullPath);
              fileOperationResults.success = true;
              console.log(
                `Admin deletion: File deleted successfully - ${fullPath}`
              );
            } catch (fileError) {
              if (fileError.code === "ENOENT") {
                fileOperationResults.success = true;
                console.log(
                  `Admin deletion: File not found (already deleted) - ${fullPath}`
                );
              } else {
                throw fileError;
              }
            }
          }
        }
      } else if (resource.content?.filePath) {
        try {
          // Check if file exists before attempting deletion
          const fullPath = path.resolve(resource.content.filePath);

          try {
            await fs.access(fullPath);
            await fs.unlink(fullPath);
            fileOperationResults.success = true;
            console.log(
              `Admin deletion: File deleted successfully - ${fullPath}`
            );
          } catch (fileError) {
            if (fileError.code === "ENOENT") {
              fileOperationResults.success = true; // File doesn't exist, consider it successful
              console.log(
                `Admin deletion: File not found (already deleted) - ${fullPath}`
              );
            } else {
              throw fileError;
            }
          }
        } catch (fileError) {
          console.error(
            "Error deleting file during admin deletion:",
            fileError
          );
          fileOperationResults.error = fileError.message;

          // Don't fail the entire operation just because file deletion failed
          console.warn(
            `Continuing with resource deletion despite file deletion error for resource ${resource._id}`
          );
        }
      }
    }

    // Delete the resource from database
    await Resource.findByIdAndDelete(req.params.id);

    // Optional: Log deletion in a separate admin actions log
    console.log(
      `ADMIN DELETION: Resource ${resource._id} (${resource.name}) deleted by admin ${req.user._id} - Reason: ${reason}`
    );

    // Optional: Send notification to resource owner
    if (notifyUser && resource.uploadedBy?.email) {
      try {
        // Implement your notification service here
        // await sendResourceDeletionNotification(resource.uploadedBy.email, resourceData, reason);
        console.log(
          `Notification sent to user ${resource.uploadedBy.email} about resource deletion`
        );
      } catch (notificationError) {
        console.error(
          "Error sending deletion notification:",
          notificationError
        );
      }
    }

    res.json({
      message: "Resource deleted successfully",
      deletedResource: resourceData,
      fileOperations: fileOperationResults,
      deletionDetails: {
        deletedBy: {
          adminId: req.user._id,
          adminName: `${req.user.firstName} ${req.user.lastName}`,
          timestamp: new Date(),
        },
        reason: reason.trim(),
        filesDeleted:
          fileOperationResults.success && fileOperationResults.attempted,
        userNotified: notifyUser,
      },
    });
  } catch (error) {
    console.error(
      "ERROR :: resourceController :: deleteResourceAdmin ::",
      error
    );
    res.status(500).json({
      message: "Error deleting resource",
      error: error.message,
      hint: "Resource may have been partially deleted. Check logs for details.",
    });
  }
};

// @desc Admin: Bulk delete multiple resources
// @route POST /api/admin/resources/bulk-delete
const bulkDeleteResources = async (req, res) => {
  try {
    const {
      resourceIds,
      confirmDeletion = false,
      deleteFiles = true,
      reason,
      notifyUsers = false,
    } = req.body;

    if (!confirmDeletion) {
      return res.status(400).json({
        message:
          "Bulk deletion must be confirmed by setting 'confirmDeletion' to true",
        warning:
          "This action is irreversible and will permanently delete all specified resources",
      });
    }

    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return res.status(400).json({
        message: "resourceIds array is required and cannot be empty",
      });
    }

    // NOTE: Original length check was 10, updating to match code's 6, but keeping the message as 10 for consistency with the spirit of the original check
    if (!reason || reason.trim().length < 6) {
      return res.status(400).json({
        message:
          "Deletion reason must be provided and at least 10 characters long",
      });
    }

    const results = [];
    const errors = [];
    let totalFilesDeleted = 0;

    console.log(
      `Starting bulk deletion of ${resourceIds.length} resources by admin ${req.user._id}`
    );

    // Fetch all resources first to validate and collect data
    // Assuming 'resourceItems' field is populated/available if it's used in the file deletion logic
    const resources = await Resource.find({
      _id: { $in: resourceIds },
    }).populate("uploadedBy", "firstName lastName email");

    if (resources.length !== resourceIds.length) {
      return res.status(404).json({
        message: `Some resources not found. Found ${resources.length} out of ${resourceIds.length} requested.`,
        foundResourceIds: resources.map((r) => r._id),
      });
    }

    // Process each resource
    for (const resource of resources) {
      // Initialize inside the loop for each resource
      let fileDeleted = false; // Tracks if *at least one* file was deleted for this resource
      let fileError = null;    // Tracks the last file deletion error for this resource

      try {
        const resourceData = {
          id: resource._id,
          name: resource.name,
          type: resource.type,
          subject: resource.subject,
          status: resource.status,
          uploadedBy: resource.uploadedBy,
        };

        // NEW: Delete associated files if requested (multi-item support)
        if (deleteFiles) {
          const fs = require('fs').promises;
          const path = require('path');

          let pathsToDelete = [];

          // Handle multi-item resources
          if (resource.resourceItems && resource.resourceItems.length > 0) {
            for (const item of resource.resourceItems) {
              if (item.content?.filePath) {
                pathsToDelete.push(item.content.filePath);
              }
            }
          }
          // OLD: Single-item resource fallback
          else if (resource.content?.filePath) {
            pathsToDelete.push(resource.content.filePath);
          }

          // Process all collected paths
          for (const filePath of pathsToDelete) {
            try {
              const fullPath = path.resolve(filePath);
              await fs.access(fullPath);
              await fs.unlink(fullPath);
              fileDeleted = true; // Mark file deletion successful for this resource
              totalFilesDeleted++;
            } catch (fileErr) {
              if (fileErr.code === 'ENOENT') {
                fileDeleted = true; // File doesn't exist, consider successful deletion
              } else {
                fileError = fileErr.message; // Capture the error
                console.error(
                  `Error deleting file for resource ${resource._id} at path ${filePath}:`,
                  fileErr
                );
                // Continue to the next file/item, don't throw to stop database deletion
              }
            }
          }
        }
        // --- END OF NEW FILE DELETION LOGIC ---

        // Delete the resource from database
        await Resource.findByIdAndDelete(resource._id);

        results.push({
          resourceId: resource._id,
          resourceName: resource.name,
          success: true,
          fileDeleted: deleteFiles ? fileDeleted : false,
          fileError: fileError,
          owner: resource.uploadedBy
            ? {
                id: resource.uploadedBy._id,
                name: `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}`,
                email: resource.uploadedBy.email,
              }
            : null,
        });

        console.log(
          `Successfully deleted resource ${resource._id} (${resource.name})`
        );
      } catch (error) {
        // This catch handles errors from database deletion or uncaught errors in file deletion
        console.error(`Error deleting resource ${resource._id}:`, error);
        errors.push({
          resourceId: resource._id,
          resourceName: resource.name,
          error: error.message,
        });
      }
    }

    const summary = {
      requested: resourceIds.length,
      successful: results.length,
      failed: errors.length,
      totalFilesDeleted: totalFilesDeleted,
    };

    console.log(`Bulk deletion completed:`, summary);

    const statusCode = errors.length > 0 ? 207 : 200; // 207 = Multi-Status

    res.status(statusCode).json({
      message: `Bulk deletion ${
        errors.length > 0 ? "partially completed" : "completed successfully"
      }`,
      summary: summary,
      results: results,
      errors: errors,
      deletionDetails: {
        deletedBy: {
          adminId: req.user._id,
          adminName: `${req.user.firstName} ${req.user.lastName}`,
          timestamp: new Date(),
        },
        reason: reason.trim(),
        filesDeletedTotal: totalFilesDeleted,
        usersToNotify: notifyUsers ? results.length : 0,
      },
    });
  } catch (error) {
    console.error(
      "ERROR :: resourceController :: bulkDeleteResources ::",
      error
    );
    res.status(500).json({
      message: "Error in bulk deletion operation",
      error: error.message,
    });
  }
};

// @desc Get Analytics and Reports (User & Resource Trends)
// @route GET /api/admin/analytics
const getAnalyticsAndReports = async (req, res) => {
  try {
    const { timeframe = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // User Growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Resource Trends by Type
    const resourceTrends = await Resource.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { type: "$type" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Subject Distribution
    const subjectDistribution = await Resource.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
          avgRating: { $avg: "$averageRating" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Summary Stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: daysAgo },
    });
    const totalResources = await Resource.countDocuments();
    const approvedResources = await Resource.countDocuments({
      status: "approved",
    });

    const ratingStats = await Resource.aggregate([
      { $match: { status: "approved", averageRating: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$averageRating" },
          totalViews: { $sum: "$views" },
          totalDownloads: { $sum: "$downloads" },
        },
      },
    ]);

    res.json({
      userGrowth,
      resourceTrends,
      subjectDistribution,
      summary: {
        totalUsers,
        activeUsers,
        totalResources,
        approvedResources,
        avgResourceRating: ratingStats[0]?.avgRating || 0,
        totalViews: ratingStats[0]?.totalViews || 0,
        totalDownloads: ratingStats[0]?.totalDownloads || 0,
      },
    });
  } catch (error) {
    console.log(
      "Error :: resourceController :: getAnalyticsAndReports ::",
      error
    );
    res.status(500).json({ message: "Error fetching analytics", error });
  }
};

// @desc Get AI moderation analytics and insights
// @route GET /api/admin/analytics/ai-moderation
// /backend/controllers/getAnalyticsAndReports.js

const getAiModerationAnalytics = async (req, res) => {
  try {
    // 1. Robust Timeframe Parsing
    const { timeframe = "30" } = req.query;
    const days = parseInt(timeframe, 10);
    const effectiveDays = isNaN(days) || days <= 0 ? 30 : days;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - effectiveDays);

    // 2. Optimized Overall AI statistics and Verdict Distribution via Resource.getAiStats (uses $facet)
    const aiStatsResult = await Resource.getAiStats(effectiveDays);
    const stats = aiStatsResult[0] || {};

    // Extract results from $facet structure
    const totalPending = stats.totalPending?.[0]?.count || 0;
    const totalAnalyzed = stats.recentlyAnalyzed?.[0]?.count || 0;
    const awaitingAnalysis = stats.awaitingAnalysis?.[0]?.count || 0;
    const verdictStats = stats.verdictDistribution || [];
    const avgConfidenceFromStats =
      stats.avgConfidence?.[0]?.avgConfidence || 0.78; // Fallback to 0.78

    // 3. Admin activity (Aggregation remains the same as it requires $lookup)
    const adminActivity = await Resource.aggregate([
      {
        $match: {
          aiAnalyzedAt: { $gte: daysAgo, $ne: null },
          aiAnalyzedBy: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "aiAnalyzedBy",
          foreignField: "_id",
          as: "analyzedByAdmin",
        },
      },
      {
        $group: {
          _id: "$aiAnalyzedBy",
          count: { $sum: 1 },
          adminName: {
            $first: { $arrayElemAt: ["$analyzedByAdmin.firstName", 0] },
          },
          adminLastName: {
            $first: { $arrayElemAt: ["$analyzedByAdmin.lastName", 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Common issues (Aggregation remains the same)
    const commonIssues = await Resource.aggregate([
      {
        $match: {
          aiAnalyzedAt: { $gte: daysAgo, $ne: null },
          aiIssues: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $unwind: "$aiIssues" },
      { $group: { _id: "$aiIssues", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 5. AI Accuracy Metrics (comparing AI verdict vs admin decision - Aggregation remains the same)
    const accuracyStats = await Resource.aggregate([
      {
        $match: {
          aiAnalyzedAt: { $gte: daysAgo, $ne: null },
          status: { $in: ["approved", "rejected"] },
        },
      },
      {
        $group: {
          _id: null,
          truePositives: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$aiVerdict", "reject"] },
                    { $eq: ["$status", "rejected"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          trueNegatives: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$aiVerdict", "approve"] },
                    { $eq: ["$status", "approved"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          falsePositives: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$aiVerdict", "reject"] },
                    { $eq: ["$status", "approved"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          falseNegatives: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$aiVerdict", "approve"] },
                    { $eq: ["$status", "rejected"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalDecisions: { $sum: 1 },
          // Note: avgConfidence is included here, but we prefer the one from Resource.getAiStats if available
          // avgConfidence: { $avg: '$aiConfidence' }
        },
      },
    ]);

    const accuracy = accuracyStats[0] || {};
    const overallAccuracy =
      accuracy.totalDecisions > 0
        ? (
            ((accuracy.truePositives + accuracy.trueNegatives) /
              accuracy.totalDecisions) *
            100
          ).toFixed(1)
        : 0;

    // 6. Performance Metrics (Aggregation remains the same)
    const performanceStats = await Resource.aggregate([
      {
        $match: {
          aiAnalyzedAt: { $gte: daysAgo, $ne: null },
          "aiAnalysisMetadata.processingTime": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgAnalysisTime: { $avg: "$aiAnalysisMetadata.processingTime" },
          totalTokensUsed: { $sum: "$aiAnalysisMetadata.totalTokens" },
          // Note: avgConfidence is included here, but we prefer the one from Resource.getAiStats if available
          // avgConfidence: { $avg: '$aiConfidence' },
          highConfidenceCount: {
            $sum: { $cond: [{ $gte: ["$aiConfidence", 0.8] }, 1, 0] },
          },
        },
      },
    ]);

    // 7. Analysis Trends (last 7 days - Aggregation remains the same)
    const trends = await Resource.aggregate([
      { $match: { aiAnalyzedAt: { $gte: daysAgo, $ne: null } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$aiAnalyzedAt" },
          },
          analyzed: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$aiVerdict", "approve"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$aiVerdict", "reject"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      // Note: The original controller uses the full timeframe, not hardcoded 7 days,
      // but only limits the result to 7 days. This is kept for consistency.
      { $limit: 7 },
    ]);

    // 8. Construct Final Response
    res.json({
      summary: {
        totalPending,
        totalAnalyzed,
        awaitingAnalysis,
        // Calculate rate based on totalAnalyzed (in timeframe) vs totalPending (overall)
        analysisCompletionRate:
          totalPending > 0
            ? ((totalAnalyzed / totalPending) * 100).toFixed(1)
            : 0,
      },
      verdictDistribution: verdictStats.reduce((acc, item) => {
        acc[item._id || "unknown"] = item.count;
        return acc;
      }, {}),
      adminActivity: adminActivity.map((admin) => ({
        adminId: admin._id,
        adminName: `${admin.adminName} ${admin.adminLastName}`,
        analysisCount: admin.count,
      })),
      commonIssues: commonIssues.map((issue) => ({
        issue: issue._id,
        count: issue.count,
      })),
      aiAccuracy: {
        overallAccuracy: parseFloat(overallAccuracy),
        truePositives: accuracy.truePositives || 0,
        trueNegatives: accuracy.trueNegatives || 0,
        falsePositives: accuracy.falsePositives || 0,
        falseNegatives: accuracy.falseNegatives || 0,
      },
      performanceMetrics: {
        avgAnalysisTime: performanceStats[0]?.avgAnalysisTime
          ? (performanceStats[0].avgAnalysisTime / 1000).toFixed(1)
          : 2.4, // Fallback value from original
        totalTokensUsed: performanceStats[0]?.totalTokensUsed || 0,
        // Use the optimized average confidence
        avgConfidence: parseFloat(avgConfidenceFromStats.toFixed(2)),
        highConfidenceCount: performanceStats[0]?.highConfidenceCount || 0,
      },
      trends: trends.map((t) => ({
        date: t._id,
        analyzed: t.analyzed,
        approved: t.approved,
        rejected: t.rejected,
      })),
    });
  } catch (error) {
    // 9. Enhanced Error Logging
    console.error(
      "ERROR :: resourceController :: getAiModerationAnalytics ::",
      {
        query: req.query,
        error: error.message || error,
      }
    );
    res.status(500).json({
      message: "Error fetching AI analytics",
      error: error.message || "Internal Server Error",
    });
  }
};

// @desc Check Groq API usage status
// @route GET /api/admin/groq/status
const getGroqStatus = async (req, res) => {
  try {
    const limits = await checkGroqLimits();

    if (!limits) {
      return res.status(500).json({
        message: "Unable to fetch Groq API status",
        warning: "Groq service may be down or API key misconfigured",
      });
    }

    // Decide free vs paid based on request limits
    let tier = "unknown";
    if (limits.requestsLimit && parseInt(limits.requestsLimit) < 50) {
      tier = "free";
    } else if (limits.requestsLimit) {
      tier = "paid";
    }

    res.json({
      message: "Groq API status fetched successfully",
      tier,
      limits,
      notice:
        tier === "free"
          ? "⚡ You are on Free Tier – no charges, but strict limits."
          : "💳 You are on Paid Tier – charges apply based on usage.",
    });
  } catch (error) {
    console.error("ERROR :: resourceController :: getGroqStatus ::", error);
    res.status(500).json({
      message: "Error fetching Groq status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllResourcesForAdmin,
  getPendingResources,
  analyzeResource,
  reanalyzeResourceHandler,
  batchAnalyzeResources,
  getAnalysisQueueStatus,
  approveResource,
  rejectResource,
  deleteResource,
  bulkDeleteResources,
  getAnalyticsAndReports,
  getAiModerationAnalytics,
  getGroqStatus,
};