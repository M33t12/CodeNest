const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const aiService = require("../services/aiQuizService");
const mongoose = require("mongoose");

// ------------------------- 1️⃣ Fetch Existing Quiz -------------------------
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    // Hide correct answers
    const quizResponse = {
      _id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      subject: quiz.subject,
      totalQuestions: quiz.totalQuestions,
      difficulty: quiz.difficulty,
      createdBy : quiz.createdBy,
      questions: quiz.questions.map(({ questionText, options, _id }) => ({
        _id,
        questionText,
        options,
      })),
    };

    res.status(200).json(quizResponse);
  } catch (error) {
    console.error("Error in getQuizById:", error);
    res.status(500).json({ message: "Failed to fetch quiz.", error: error.message });
  }
};

// ------------------------- 2️⃣ Generate New Quiz -------------------------
exports.generateQuiz = async (req, res) => {
  try {
    const { title, subject, topic="", totalQuestions, difficulty,timeLimit } = req.body;
    const userId = req.user.id;

    // Adaptive difficulty based on last 3 submissions
    const pastSubmissions = await QuizSubmission.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(3);

    let adaptiveDifficultyLevel = "MEDIUM";
    if (pastSubmissions.length > 0) {
      const averageScore =
        pastSubmissions.reduce((sum, sub) => sum + sub.score, 0) /
        pastSubmissions.length;
      if (averageScore > totalQuestions * 0.8) adaptiveDifficultyLevel = "HARD";
      else if (averageScore < totalQuestions * 0.4) adaptiveDifficultyLevel = "EASY";
    }

    const generatedQuestions = await aiService.generateQuiz({
      topic,
      subject,
      totalQuestions,
      difficulty,
      adaptiveDifficultyLevel,
      timeLimit,
    });

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return res.status(500).json({ message: "AI failed to generate quiz questions." });
    }

    const newQuiz = new Quiz({
      title,
      topic,
      subject,
      totalQuestions,
      difficulty,
      timeLimit,
      questions: generatedQuestions,
      createdBy: userId,
    });

    await newQuiz.save();

    const quizResponse = {
      _id: newQuiz._id,
      title: newQuiz.title,
      topic : newQuiz.topic,
      subject: newQuiz.subject,
      totalQuestions: newQuiz.totalQuestions,
      difficulty: newQuiz.difficulty,
      timeLimit : newQuiz.timeLimit,
      createdBy : newQuiz.createdBy,
      questions: newQuiz.questions.map(({ questionText, options, _id }) => ({
        _id,
        questionText,
        options,
      })),
    };

    res.status(201).json(quizResponse);
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    res.status(500).json({ message: "Failed to generate quiz.", error: error.message });
  }
};

// ------------------------- 3️⃣ Request hint for a Question -------------------------
// exports.getQuestionHint = async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const { questionId } = req.body;
//     if (!quizId || !questionId)
//       return res.status(400).json({ message: "quizId and questionId are required." });

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ message: "Quiz not found." });

//     const question = quiz.questions.id(questionId);
//     if (!question) return res.status(404).json({ message: "Question not found." });

//     const hintResponse = await aiService.generateHint(question.questionText);
//     res.status(200).json({ hint: hintResponse.hint });
//   } catch (error) {
//     console.error("Error in getQuestionTip:", error);
//     res.status(500).json({ message: "Failed to generate hint.", error: error.message });
//   }
// };
exports.getQuestionHint = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionId } = req.body;
    const userId = req.user.id;

    if (!quizId || !questionId)
      return res.status(400).json({ message: "quizId and questionId are required." });

    // 1️⃣ Find quiz and question
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    const question = quiz.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    // 2️⃣ Generate hint via AI
    const hintResponse = await aiService.generateHint(question.questionText);
    const hint = hintResponse?.hint || "No hint generated.";

    // 3️⃣ Find or create a “pending” submission
    let submission = await QuizSubmission.findOne({ userId, quizId });

    if (!submission) {
      submission = new QuizSubmission({
        userId,
        quizId,
        responses: [],
        hintRequests: [],
        status: "pending", // 👈 mark it as not-finalized
        createdAt: new Date(),
      });
    }

    // 4️⃣ Save hint in submission
    submission.hintRequests.push({
      questionId,
      hint,
      requestedAt: new Date(),
    });

    await submission.save();

    // 5️⃣ Return hint
    res.status(200).json({
      message: "Hint generated successfully.",
      hint,
      status: submission.status,
    });
  } catch (error) {
    console.error("Error in getQuestionHint:", error);
    res.status(500).json({
      message: "Failed to generate hint.",
      error: error.message,
    });
  }
};



// ------------------------- 4️⃣ Submit Quiz -------------------------
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, responses, timeTaken } = req.body;
    const userId = req.user.id;

    if (!quizId || !Array.isArray(responses)) {
      return res.status(400).json({ message: "quizId and responses are required." });
    }

    // 1️⃣ Fetch quiz and validate
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    // 2️⃣ Evaluate responses
    let score = 0;
    let incorrectQuestions = [];

    const evaluatedResponses = responses.map((userResponse) => {
      const question = quiz.questions.id(userResponse.questionId);
      const isCorrect = question && question.correctAnswer === userResponse.userResponse;

      if (isCorrect) score++;
      else if (question) incorrectQuestions.push(question);

      return {
        questionId: userResponse.questionId,
        userResponse: userResponse.userResponse,
        isCorrect,
        correctAnswer: question?.correctAnswer || null,
      };
    });

    // 3️⃣ Generate AI improvement tips for incorrect questions
    const tipsResponse = await aiService.generateImprovementTips(incorrectQuestions);

    // 4️⃣ Check if there's already a "pending" submission (created when hints were requested)
    let submission = await QuizSubmission.findOne({ userId, quizId ,status:'pending' });

    if (submission) {
      // 5️⃣ Update existing pending submission
      submission.responses = evaluatedResponses;
      submission.score = score;
      submission.timeTaken = timeTaken || 0;
      submission.aiSummary = tipsResponse?.tips || [];
      submission.status = "completed";
      submission.submittedAt = new Date();
    } else {
      // 6️⃣ Create a new submission if none exists
      submission = new QuizSubmission({
        userId,
        quizId,
        responses: evaluatedResponses,
        score,
        timeTaken,
        aiSummary: tipsResponse?.tips || [],
        status: "completed",
      });
    }

    await submission.save();

    // 7️⃣ Respond
    res.status(200).json({
      message: "Quiz submitted successfully.",
      score,
      totalQuestions: quiz.questions.length,
      hintsUsed: submission.hintRequests?.length || 0,
      aiSummary: submission.aiSummary,
      submissionId: submission._id,
      quizDetails: quiz,
      submissionDetails: submission,
    });
  } catch (error) {
    console.error("Error in submitQuiz:", error);
    res.status(500).json({
      message: "Failed to submit quiz.",
      error: error.message,
    });
  }
};


// ------------------------- 5️⃣ Fetch User Quiz History -------------------------
exports.getUserQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, minScore, maxScore, from, to } = req.query;

    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quizDetails",
        },
      },
      { $unwind: "$quizDetails" },
      {
        $match: {
          ...(subject && { "quizDetails.subject": subject }),
          ...(minScore && { score: { $gte: parseInt(minScore) } }),
          ...(maxScore && { score: { $lte: parseInt(maxScore) } }),
          ...((from || to) && {
            submittedAt: {
              ...(from && { $gte: new Date(from) }),
              ...(to && { $lte: new Date(to) }),
            },
          }),
        },
      },
    ];

    const history = await QuizSubmission.aggregate(pipeline);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error in getUserQuizHistory:", error);
    res.status(500).json({ message: "Failed to retrieve history.", error: error.message });
  }
};

// ------------------------- 6️⃣ Re-attempt Quiz -------------------------
exports.reAttemptQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    res.status(200).json({
      message: "You can now retake the quiz. Submit your answers to /quiz/submit.",
      quizId: quiz._id,
      questions: quiz.questions.map(({ questionText, options, _id }) => ({
        _id,
        questionText,
        options,
      })),
    });
  } catch (error) {
    console.error("Error in reAttemptQuiz:", error);
    res.status(500).json({ message: "Failed to prepare re-attempt.", error: error.message });
  }
};
