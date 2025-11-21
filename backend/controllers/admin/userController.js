// backend/controllers/admin/userController.js
const User = require("../../models/User.js");
const Resource = require('../../models/Resource.js');
const Quiz = require('../../models/Quiz.js');

// @desc Get Admin Dashboard Overview
// @route GET /api/admin/dashboard
const getDashboardOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const blockedUsers = await User.countDocuments({ status: 'blocked' });

    const totalResources = await Resource.countDocuments();
    const pendingResources = await Resource.countDocuments({ status: 'pending' });
    const approvedResources = await Resource.countDocuments({ status: 'approved' });
    const rejectedResources = await Resource.countDocuments({ status: 'rejected' });

    // const totalQuizzes = await Quiz.countDocuments(); // Uncomment if Quiz model is fully integrated

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const recentResources = await Resource.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const mostActiveUsers = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          resourceCount: { $size: '$resourcesUploaded' },
          quizCount: { $size: '$quizHistory' },
          dsaTotalSolved: '$dsaProgress.totalSolved'
        }
      },
      { $sort: { resourceCount: -1 } },
      { $limit: 5 }
    ]);

    const dashboardStats = {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        active: activeUsers,
        blocked: blockedUsers,
        recentSignups: recentUsers
      },
      resources: {
        total: totalResources,
        pending: pendingResources,
        approved: approvedResources,
        rejected: rejectedResources,
        recent: recentResources
      },
      platform: {
        // totalQuizzes,
      },
      mostActiveUsers
    };
    res.json(dashboardStats);
  } catch (error) {
    console.log("ERROR :: userController :: getDashboardOverview ::", error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

// @desc Get All Users with Filtering and Pagination
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .populate('resourcesUploaded', 'name subject status createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    const usersWithActivity = users.map(user => ({
      ...user.toObject(),
      activitySummary: user.getActivitySummary() // Assuming getActivitySummary is a method on the User model
    }));

    res.json({
      users: usersWithActivity,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log("Error :: userController :: getAllUsers ::", error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// @desc Get Single User Details
// @route GET /api/admin/users/:userId
const getSingleUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('resourcesUploaded')
      .populate('quizHistory.quizId')
      // .populate('dsaProgress.solvedQuestions.questionId')
      .populate('blockedBy', 'firstName lastName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resourceStats = await Resource.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentResources = await Resource.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject type status createdAt');

    const userDetails = {
      ...user.toObject(),
      activitySummary: user.getActivitySummary(),
      resourceStats: resourceStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentActivities: {
        recentResources
      }
    };

    res.json(userDetails);
  } catch (error) {
    console.log("Error :: userController :: getSingleUserDetails ::", error);
    res.status(500).json({ message: 'Error fetching user details', error });
  }
};

// @desc Block User
// @route PUT /api/admin/users/:userId/block
const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const userToBlock = await User.findById(req.params.userId);

    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToBlock.status === 'blocked') {
      return res.status(403).json({ message: 'Cannot block user which is already blocked.' });
    }

    if (userToBlock.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block admin users' });
    }

    const blockedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        status: 'blocked',
        blockedBy: req.user._id,
        blockedAt: new Date(),
        blockReason: reason,
      },
      { new: true }
    );

    res.json({
      message: 'User blocked successfully',
      user: blockedUser
    });
  } catch (error) {
    console.log("ERROR :: userController :: blockUser ::", error);
    res.status(500).json({ message: 'Error blocking user', error });
  }
};

// @desc Unblock User
// @route PUT /api/admin/users/:userId/unblock
const unblockUser = async (req, res) => {
  try {
    const userToUnblock = await User.findById(req.params.userId);

    if (!userToUnblock) {
      return res.status(404).json({ message: 'User not found' });
    }

    const unblockedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        status: 'active',
        blockedBy: undefined,
        blockedAt: undefined,
        blockReason: undefined,
      },
      { new: true }
    );

    res.json({
      message: 'User unblocked successfully',
      user: unblockedUser
    });
  } catch (error) {
    console.log("ERROR :: userController :: unblockUser ::", error);
    res.status(500).json({ message: 'Error unblocking user', error });
  }
};

// @desc Promote User to Admin
// @route PUT /api/admin/users/:userId/promote
const promoteUser = async (req, res) => {
  try {
    const userToPromote = await User.findById(req.params.userId);

    if (!userToPromote) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToPromote.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    const promotedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        role: 'admin',
        createdBy: req.user._id,
      },
      { new: true }
    );

    res.json({
      message: 'User promoted to admin successfully',
      user: promotedUser
    });
  } catch (error) {
    console.log("ERROR :: userController :: promoteUser ::", error);
    res.status(500).json({ message: 'Error promoting user', error });
  }
};

// @desc Demote Admin to User
// @route PUT /api/admin/users/:userId/demote
const demoteUser = async (req, res) => {
  try {
    const userToDemote = await User.findById(req.params.userId);

    if (!userToDemote) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDemote.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Check if the current admin is trying to demote a user they didn't promote
    if (userToDemote.createdBy && userToDemote.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot demote a user you did not promote' });
    }

    // Count the number of active admins
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1 && userToDemote._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot demote yourself. There must be at least one active admin.' });
    }

    const demotedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        role: 'user',
        createdBy: undefined,
      },
      { new: true }
    );

    res.json({
      message: 'Admin demoted to user successfully',
      user: demotedUser
    });
  } catch (error) {
    console.log("ERROR :: userController :: demoteUser ::", error);
    res.status(500).json({ message: 'Error demoting user', error });
  }
};

// @desc Delete a user
// @route DELETE /api/admin/users/:userId
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.userId);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of active admins
    if (userToDelete.role === 'admin' && userToDelete.status === 'active') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last active admin.' });
      }
    }

    // Clean up related documents
    await Resource.deleteMany({ uploadedBy: req.params.userId });
    await Quiz.deleteMany({ createdFor: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.log("ERROR :: userController :: deleteUser ::", error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// @desc System Activities Log (Simple implementation)
// @route GET /api/admin/activities
const getSystemActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch recent resources and users for a simple activity feed
    const recentResources = await Resource.find()
      .populate('uploadedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email role createdAt');

    const activities = [];

    recentResources.forEach(resource => {
      activities.push({
        type: 'resource',
        action: resource.status === 'pending' ? 'uploaded' : resource.status,
        description: `${resource.uploadedBy?.firstName} ${resource.uploadedBy?.lastName} ${resource.status === 'pending' ? 'uploaded' : resource.status} resource "${resource.name}"`,
        user: resource.uploadedBy,
        resource: resource,
        timestamp: resource.updatedAt
      });
    });

    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        action: 'registered',
        description: `${user.firstName} ${user.lastName} joined the platform`,
        user: user,
        timestamp: user.createdAt
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities: activities.slice(skip, skip + parseInt(limit)),
      total: activities.length
    });
  } catch (error) {
    console.log("Error :: userController :: getSystemActivities ::", error);
    res.status(500).json({ message: 'Error fetching activities', error });
  }
};


module.exports = {
  getDashboardOverview,
  getAllUsers,
  getSingleUserDetails,
  blockUser,
  unblockUser,
  promoteUser,
  demoteUser,
  deleteUser,
  getSystemActivities,
};