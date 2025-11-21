// models/Resource.js (Updated with AI analysis tracking)
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    subject: {
      type: String,
      enum: [
        "Data Structures",
        "Algorithms",
        "Operating Systems",
        "Database Systems",
        "Computer Networks",
        "Software Engineering",
        "Theory of Computation",
        "Artificial Intelligence",
        "Machine Learning",
        "Web Development",
        "Cybersecurity",
        "Programming Languages",
        "Computer Graphics",
        "Human Computer Interaction",
      ],
      required: true,
    },

    // Unique slug for clean URLs
    slug: { type: String, unique: true, index: true },

    // Tags for discovery
    tags: [{ type: String }],

    // Flexible content structure for different resource types
    resourceItems: [
      {
        itemType: {
          type: String,
          enum: ["pdf", "image", "link", "blog", "markdown"],
          required: true,
        },
        content: {
          // For uploaded files (PDF, Image)
          url: String,
          fileName: String,
          storedName: String,
          fileSize: Number,
          mimeType: String,
          filePath: String,

          // PDF specific
          pages: Number,

          // Image specific
          width: Number,
          height: Number,

          // Text content (blog, markdown)
          text: String,
          htmlContent: String,

          // Common fields
          description: String,
          thumbnailUrl: String,

          // External link metadata
          title: String,
          favicon: String,
          siteName: String,
        },
        order: { type: Number, default: 0 }, // For ordering items
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Add this for backward compatibility / primary type indicator
    primaryType: {
      type: String,
      enum: ["pdf", "image", "link", "blog", "markdown", "mixed"],
      default: "mixed",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Rating system
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // Admin approval tracking
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    rejectionReason: String,
    adminNotes: String,

    // AI moderation fields (ENHANCED)
    aiFeedback: { type: String, default: null },
    aiVerdict: {
      type: String,
      enum: ["approve", "reject", "neutral", "unknown"],
      default: "unknown",
    },
    aiConfidence: { type: Number, min: 0, max: 1, default: 0 },
    aiIssues: { type: [String], default: [] },
    aiRecommendations: { type: [String], default: [] }, // NEW: AI recommendations
    aiAnalyzedAt: { type: Date, default: null },
    aiAnalyzedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // NEW: Track previous AI analyses for comparison
    previousAiAnalyses: [
      {
        verdict: String,
        confidence: Number,
        feedback: String,
        issues: [String],
        analyzedAt: Date,
        reanalyzedAt: { type: Date, default: Date.now },
        reanalyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // NEW: AI analysis metadata
    aiAnalysisMetadata: {
      totalAnalyses: { type: Number, default: 0 }, // How many times analyzed
      rawResponse: String, // Store raw AI response for debugging
      processingTime: Number, // Time taken for analysis (milliseconds)
      apiVersion: String, // Which AI model/version was used
      errorCount: { type: Number, default: 0 }, // Track failed analysis attempts
      totalTokens: { type: Number, default: 0 }, // Add this field
    },

    // Analytics
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },

    // Featured/promoted resources
    isFeatured: { type: Boolean, default: false },
    featuredAt: Date,

    // Version control for resources
    version: { type: String, default: "1.0" },
    previousVersions: [
      {
        version: String,
        content: Object,
        updatedAt: Date,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

// Enhanced indexes for AI analysis
resourceSchema.index({ status: 1, subject: 1 });
resourceSchema.index({ uploadedBy: 1, status: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ averageRating: -1 });
resourceSchema.index({ views: -1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ aiVerdict: 1, aiConfidence: -1 });
resourceSchema.index({ aiAnalyzedAt: 1 });
resourceSchema.index({ status: 1, aiAnalyzedAt: 1 });
resourceSchema.index({
  status: 1,
  aiVerdict: 1,
  aiAnalyzedAt: 1,
});

// NEW: Compound index for AI analysis queue queries
resourceSchema.index({
  status: 1,
  aiAnalyzedAt: 1,
  aiVerdict: 1,
  createdAt: 1,
});

// Pre-save hooks (enhanced)
resourceSchema.pre("save", function (next) {
  // Recalculate ratings only if ratings were modified
  if (this.isModified("ratings")) {
    if (this.ratings.length > 0) {
      const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
      this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
      this.totalRatings = this.ratings.length;
    } else {
      this.averageRating = 0;
      this.totalRatings = 0;
    }
  }

  // Auto-generate slug if missing
  if (!this.slug && this.name) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);

    const suffix =
      this._id?.toString().slice(-6) || Math.random().toString(36).slice(-6);
    this.slug = `${base}-${suffix}`;
  }

  // NEW: Update AI analysis metadata
  if (this.isModified("aiAnalyzedAt") && this.aiAnalyzedAt) {
    if (!this.aiAnalysisMetadata) {
      this.aiAnalysisMetadata = {};
    }
    this.aiAnalysisMetadata.totalAnalyses =
      (this.aiAnalysisMetadata.totalAnalyses || 0) + 1;
    this.aiAnalysisMetadata.apiVersion = "groq-llama-3.1-70b";
  }

  next();
});

// Enhanced virtual properties
resourceSchema.virtual("formattedFileSize").get(function () {
  if (!this.content?.fileSize) return null;

  const bytes = this.content.fileSize;
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Enhanced AI status virtual
resourceSchema.virtual("aiStatus").get(function () {
  if (!this.aiAnalyzedAt || this.aiVerdict === "unknown") {
    return "awaiting_analysis";
  }

  if (this.aiAnalysisMetadata?.errorCount > 0) {
    return "analysis_failed";
  }

  return "analyzed";
});

// NEW: AI confidence level virtual
resourceSchema.virtual("aiConfidenceLevel").get(function () {
  if (this.aiConfidence >= 0.8) return "high";
  if (this.aiConfidence >= 0.6) return "medium";
  if (this.aiConfidence >= 0.3) return "low";
  return "very-low";
});

// Enhanced decision status virtual
resourceSchema.virtual("decisionStatus").get(function () {
  if (this.status !== "pending") {
    return this.status;
  }

  if (!this.aiAnalyzedAt || this.aiVerdict === "unknown") {
    return "awaiting_ai_analysis";
  }

  if (this.aiAnalysisMetadata?.errorCount > 0) {
    return "ai_analysis_failed";
  }

  return "ready_for_decision";
});

// Enhanced instance methods
resourceSchema.methods.canEdit = function (userId) {
  return this.uploadedBy.toString() === userId.toString();
};

resourceSchema.methods.isEditable = function () {
  return this.status === "pending";
};

// ADD this new helper method:
resourceSchema.methods.getResourceTypes = function() {
  return [...new Set(this.resourceItems.map(item => item.itemType))];
};

resourceSchema.methods.needsAiAnalysis = function () {
  return (
    !this.aiAnalyzedAt ||
    this.aiVerdict === "unknown" ||
    this.aiConfidence === 0
  );
};

resourceSchema.methods.isReadyForDecision = function () {
  return (
    this.status === "pending" &&
    this.aiAnalyzedAt &&
    this.aiVerdict !== "unknown" &&
    (!this.aiAnalysisMetadata?.errorCount ||
      this.aiAnalysisMetadata.errorCount === 0)
  );
};

// NEW: Check if AI recommends rejection with high confidence
resourceSchema.methods.aiRecommendsRejection = function () {
  return this.aiVerdict === "reject" && this.aiConfidence >= 0.7;
};

// NEW: Check if AI recommends approval with high confidence
resourceSchema.methods.aiRecommendsApproval = function () {
  return this.aiVerdict === "approve" && this.aiConfidence >= 0.8;
};

// NEW: Get AI analysis summary
resourceSchema.methods.getAiSummary = function () {
  return {
    verdict: this.aiVerdict,
    confidence: this.aiConfidence,
    confidenceLevel: this.aiConfidenceLevel,
    feedback: this.aiFeedback,
    issues: this.aiIssues,
    recommendations: this.aiRecommendations,
    analyzedAt: this.aiAnalyzedAt,
    analyzedBy: this.aiAnalyzedBy,
    needsAnalysis: this.needsAiAnalysis(),
    readyForDecision: this.isReadyForDecision(),
    recommendsApproval: this.aiRecommendsApproval(),
    recommendsRejection: this.aiRecommendsRejection(),
    totalAnalyses: this.aiAnalysisMetadata?.totalAnalyses || 0,
    hasErrors: (this.aiAnalysisMetadata?.errorCount || 0) > 0,
  };
};

resourceSchema.methods.getAnalytics = function () {
  return {
    views: this.views || 0,
    downloads: this.downloads || 0,
    totalRatings: this.totalRatings || 0,
    averageRating: this.averageRating || 0,
    status: this.status,
    createdAt: this.createdAt,
    approvedAt: this.approvedAt,
    aiStatus: this.aiStatus,
    decisionStatus: this.decisionStatus,
    aiSummary: this.getAiSummary(),
  };
};

// NEW: Get total file size for multi-item resources
resourceSchema.methods.getTotalFileSize = function() {
  if (this.resourceItems && this.resourceItems.length > 0) {
    return this.resourceItems.reduce((total, item) => {
      return total + (item.content?.fileSize || 0);
    }, 0);
  }
  return this.content?.fileSize || 0;
};

// NEW: Get all file paths for cleanup operations
resourceSchema.methods.getAllFilePaths = function() {
  const paths = [];
  
  if (this.resourceItems && this.resourceItems.length > 0) {
    this.resourceItems.forEach(item => {
      if (item.content?.filePath) {
        paths.push(item.content.filePath);
      }
    });
  } else if (this.content?.filePath) {
    paths.push(this.content.filePath);
  }
  
  return paths;
};

// NEW: Check if resource has files
resourceSchema.methods.hasFiles = function() {
  if (this.resourceItems && this.resourceItems.length > 0) {
    return this.resourceItems.some(item => 
      item.content?.filePath && (item.itemType === 'pdf' || item.itemType === 'image')
    );
  }
  return this.content?.filePath && (this.type === 'pdf' || this.type === 'image');
};

// Enhanced static methods

// Find resources awaiting AI analysis (with priority)
resourceSchema.statics.findAwaitingAiAnalysis = function (
  limit = 10,
  priority = "oldest"
) {
  const baseQuery = {
    status: "pending",
    $or: [
      { aiAnalyzedAt: { $exists: false } },
      { aiAnalyzedAt: null },
      { aiVerdict: "unknown" },
    ],
  };

  let sortOrder = { createdAt: 1 }; // Oldest first by default

  if (priority === "newest") {
    sortOrder = { createdAt: -1 };
  } else if (priority === "failed") {
    // Prioritize resources that had failed analysis attempts
    baseQuery["aiAnalysisMetadata.errorCount"] = { $gt: 0 };
  }

  return this.find(baseQuery)
    .populate("uploadedBy", "firstName lastName email")
    .sort(sortOrder)
    .limit(limit);
};

// Find resources ready for admin decision (with AI verdict filtering)
resourceSchema.statics.findReadyForDecision = function (
  verdictFilter = null,
  limit = 10
) {
  const query = {
    status: "pending",
    aiAnalyzedAt: { $exists: true, $ne: null },
    aiVerdict: { $ne: "unknown" },
  };

  if (
    verdictFilter &&
    ["approve", "reject", "neutral"].includes(verdictFilter)
  ) {
    query.aiVerdict = verdictFilter;
  }

  return this.find(query)
    .populate("uploadedBy", "firstName lastName email")
    .populate("aiAnalyzedBy", "firstName lastName")
    .sort({ aiAnalyzedAt: -1 })
    .limit(limit);
};

// NEW: Get resources with AI analysis errors
resourceSchema.statics.findAnalysisErrors = function (limit = 10) {
  return this.find({
    status: "pending",
    "aiAnalysisMetadata.errorCount": { $gt: 0 },
  })
    .populate("uploadedBy", "firstName lastName email")
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Enhanced AI statistics with error tracking
resourceSchema.statics.getAiStats = function (timeframe = 30) {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - timeframe);

  return this.aggregate([
    {
      $facet: {
        totalPending: [{ $match: { status: "pending" } }, { $count: "count" }],
        awaitingAnalysis: [
          {
            $match: {
              status: "pending",
              $or: [
                { aiAnalyzedAt: { $exists: false } },
                { aiAnalyzedAt: null },
                { aiVerdict: "unknown" },
              ],
            },
          },
          { $count: "count" },
        ],
        recentlyAnalyzed: [
          {
            $match: {
              aiAnalyzedAt: { $gte: daysAgo, $ne: null },
            },
          },
          { $count: "count" },
        ],
        verdictDistribution: [
          {
            $match: {
              aiAnalyzedAt: { $gte: daysAgo, $ne: null },
              aiVerdict: { $ne: "unknown" },
            },
          },
          { $group: { _id: "$aiVerdict", count: { $sum: 1 } } },
        ],
        analysisErrors: [
          {
            $match: {
              "aiAnalysisMetadata.errorCount": { $gt: 0 },
              updatedAt: { $gte: daysAgo },
            },
          },
          { $count: "count" },
        ],
        avgConfidence: [
          {
            $match: {
              aiAnalyzedAt: { $gte: daysAgo, $ne: null },
              aiConfidence: { $gt: 0 },
            },
          },
          { $group: { _id: null, avgConfidence: { $avg: "$aiConfidence" } } },
        ],
      },
    },
  ]);
};

// Find similar resources (existing method kept)
resourceSchema.statics.findSimilar = function (
  resourceId,
  subject,
  tags = [],
  limit = 5
) {
  const query = {
    _id: { $ne: resourceId },
    status: "approved",
  };
};

module.exports = mongoose.model("Resource", resourceSchema);
