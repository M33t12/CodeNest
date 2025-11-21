// controllers/problemController.js
const Problem = require('../models/Problem');
const leetcodeService = require('../services/leetcodeService');

// Sync problems from LeetCode to database
exports.syncProblems = async (req, res) => {
  try {
    console.log('Starting LeetCode sync...');
    const problems = await leetcodeService.fetchAllProblems();
    
    let synced = 0;
    let updated = 0;

    for (const problem of problems) {
      const problemData = {
        leetcodeId: problem.frontendQuestionId,
        titleSlug: problem.titleSlug,
        title: problem.title,
        difficulty: problem.difficulty,
        topics: problem.topicTags.map(tag => tag.name),
        isPremium: problem.paidOnly,
        acRate: parseFloat(problem.acRate),
        leetcodeUrl: `https://leetcode.com/problems/${problem.titleSlug}/`,
        lastSynced: new Date()
      };

      const result = await Problem.findOneAndUpdate(
        { titleSlug: problem.titleSlug },
        problemData,
        { upsert: true, new: true }
      );

      if (result) {
        result.isNew ? synced++ : updated++;
      }
    }

    res.json({
      success: true,
      message: 'Problems synced successfully',
      stats: {
        total: problems.length,
        synced,
        updated
      }
    });
  } catch (error) {
    console.log("ERROR :: ProblemController.js :: syncProblems ",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all problems with filters
// exports.getProblems = async (req, res) => {
//   try {
//     const {
//       difficulty,
//       topic,
//       search,
//       page = 1,
//       limit = 50,
//       sortBy = 'leetcodeId'
//     } = req.query;

//     const query = {};
    
//     // if (difficulty) {
//     //   query.difficulty = difficulty;
//     // }
    
//     // if (topic) {
//     //   query.topics = { $in: [topic] };
//     // }
    
//     // if (search) {
//     //   query.$or = [
//     //     { title: { $regex: search, $options: 'i' } },
//     //     { titleSlug: { $regex: search, $options: 'i' } }
//     //   ];
//     // }

//     if (difficulty && difficulty.trim()) query.difficulty = difficulty.trim();
//     if (topic && topic.trim()) query.topics = { $in: [topic.trim()] };
//     if (search && search.trim()) {
//       query.$or = [
//         { title: { $regex: search.trim(), $options: 'i' } },
//         { titleSlug: { $regex: search.trim(), $options: 'i' } }
//       ];
//     }
//     const skip = (page - 1) * limit;
    
//     const [problems, total] = await Promise.all([
//       Problem.find(query)
//         .sort(sortBy)
//         .skip(skip)
//         .limit(parseInt(limit))
//         .lean(),
//       Problem.countDocuments(query)
//     ]);

//     res.json({
//       success: true,
//       data: problems,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.log("ERROR :: ProblemController.js :: getProblems",error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// Get all problems with filters
exports.getProblems = async (req, res) => {
  try {
    const {
      difficulty,
      topic,
      search,
      page = 1,
      limit = 50,
      sortBy = 'leetcodeId'
    } = req.query;

    const query = {};

    // ✅ Ignore empty or undefined filters
    if (difficulty && difficulty.trim()) {
      query.difficulty = difficulty.trim();
    }

    if (topic && topic.trim()) {
      query.topics = { $in: [topic.trim()] };
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { titleSlug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 🧠 Debugging info (logs to console)
    console.log("GET /api/problems");
    console.log("Query used:", query);
    console.log("Pagination:", { page, limit, skip });
    console.log("Sort by:", sortBy);

    // Fetch data + total count in parallel
    const [problems, total] = await Promise.all([
      Problem.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Problem.countDocuments(query)
    ]);

    // ✅ Log how many records were found
    console.log(`Found ${problems.length} problems (Total: ${total})`);

    res.json({
      success: true,
      data: problems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log("ERROR :: ProblemController.js :: getProblems", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get problem by slug
exports.getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await Problem.findOne({ titleSlug: slug });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.log("ERROR :: ProblemController.js :: getProblemBySlug",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get topics with problem count
exports.getTopics = async (req, res) => {
  try {
    const topics = await Problem.aggregate([
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 },
          easy: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] }
          },
          hard: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          difficulty: {
            easy: '$easy',
            medium: '$medium',
            hard: '$hard'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.log("ERROR :: ProblemController.js :: getTopics",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Problem.countDocuments();
    
    const formattedStats = {
      total,
      byDifficulty: stats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.log("ERROR :: ProblemController.js :: getStatistics",error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};