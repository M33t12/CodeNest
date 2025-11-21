// controllers/progressController.js
const UserProgress = require('../models/UserProgress');
const mongoose = require("mongoose");

// Get user progress for all problems
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, topic } = req.query;

    const query = { userId };
    
    if (status) {
      query.status = status;
    }

    const progress = await UserProgress.find(query)
      .populate('problemId')
      .sort('-updatedAt')
      .lean();

    // Filter by topic if specified
    let filteredProgress = progress;
    if (topic) {
      filteredProgress = progress.filter(p => 
        p.problemId && p.problemId.topics.includes(topic)
      );
    }

    // Calculate statistics
    const stats = {
      total: progress.length,
      solved: progress.filter(p => p.status === 'solved').length,
      attempted: progress.filter(p => p.status === 'attempted').length,
      notStarted: progress.filter(p => p.status === 'not-started').length
    };

    res.json({
      success: true,
      data: filteredProgress,
      stats
    });
  } catch (error) {
    console.log("ERROR :: ProgressController.js :: getUserProgress",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update problem progress
exports.updateProgress = async (req, res) => {
  try {
    const { userId, problemId } = req.params;
    const { status, notes, timeSpent, approach, tags } = req.body;

    const updateData = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'attempted' || status === 'solved') {
        updateData.lastAttempted = new Date();
        updateData.$inc = { attemptCount: 1 };
      }
      if (status === 'solved' && !updateData.solvedAt) {
        updateData.solvedAt = new Date();
      }
    }
    
    if (notes !== undefined) updateData.notes = notes;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (approach !== undefined) updateData.approach = approach;
    if (tags !== undefined) updateData.tags = tags;

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      updateData,
      { upsert: true, new: true }
    ).populate('problemId');

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.log("ERROR :: ProgressController.js :: updateProgress",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get progress statistics
exports.getProgressStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await UserProgress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: {
            status: '$status',
            difficulty: '$problem.difficulty'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = {
      byStatus: {},
      byDifficulty: {
        Easy: { solved: 0, attempted: 0, total: 0 },
        Medium: { solved: 0, attempted: 0, total: 0 },
        Hard: { solved: 0, attempted: 0, total: 0 }
      }
    };

    stats.forEach(stat => {
      const { status, difficulty } = stat._id;
      if (!formatted.byStatus[status]) {
        formatted.byStatus[status] = 0;
      }
      formatted.byStatus[status] += stat.count;
      
      if (formatted.byDifficulty[difficulty]) {
        formatted.byDifficulty[difficulty][status] = stat.count;
        formatted.byDifficulty[difficulty].total += stat.count;
      }
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.log("ERROR :: ProgressController.js :: getProgressStats",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
