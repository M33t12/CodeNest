import React from "react";
import {
  Trophy,
  TrendingUp,
  Clock,
  Lightbulb,
  RefreshCw,
  Home,
  Target,
  Award,
  BookOpen
} from "lucide-react";
import { useAIStore } from "../../store/aiStore";

const QuizResults = () => {
  const {
    quizResults,
    clearCurrentQuiz,
    hintRequests,
    reAttemptQuiz,
    quizReview,
    setQuizReview,
  } = useAIStore();

  if (!quizResults) return null;

  const {
    score,
    totalQuestions,
    hintsUsed,
    aiSummary,
    quizDetails,
    submissionDetails,
  } = quizResults;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getPerformanceLevel = () => {
    if (percentage >= 90)
      return { level: "Excellent", color: "green", icon: Trophy };
    if (percentage >= 75) return { level: "Good", color: "blue", icon: Award };
    if (percentage >= 50)
      return { level: "Fair", color: "yellow", icon: Target };
    return { level: "Needs Improvement", color: "red", icon: TrendingUp };
  };

  const handleReviewQuiz = () => {
    // 1. Set the review data
    setQuizReview({
      quiz: quizDetails,
      submission: submissionDetails,
    });
    // 2. Clear quizResults to switch view (AIModule handles the display logic)
    // Note: The store needs a setQuizReview action or we use set() directly (not ideal).
    // Let's create a new action in aiStore.js for a clean transition.
  };

  const performance = getPerformanceLevel();
  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 bg-${performance.color}-100 rounded-full mb-4`}
        >
          <PerformanceIcon
            className={`text-${performance.color}-600`}
            size={48}
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz Completed!
        </h2>
        <p className="text-gray-600">Here's how you performed</p>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl p-8 text-white">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{percentage}%</div>
          <div className="text-xl opacity-90 mb-4">
            {score} out of {totalQuestions} correct
          </div>
          <div
            className={`inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full text-lg font-semibold`}
          >
            {performance.level}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {score}/{totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hints Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {hintsUsed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Improvement Tips */}
      {aiSummary && aiSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">
              AI-Powered Improvement Tips
            </h3>
          </div>

          <div className="space-y-3">
            {aiSummary.map((tip, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Performance Breakdown
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Correct Answers</span>
              <span>{score} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(score / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Incorrect Answers</span>
              <span>{totalQuestions - score} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    ((totalQuestions - score) / totalQuestions) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {hintsUsed > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Questions with Hints</span>
                <span>{hintsUsed} questions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: `${(hintsUsed / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div
        className={`bg-gradient-to-r ${
          percentage >= 75
            ? "from-green-50 to-emerald-50 border-green-200"
            : "from-blue-50 to-indigo-50 border-blue-200"
        } border rounded-lg p-6`}
      >
        <div className="flex items-start space-x-3">
          <Award
            className={`${
              percentage >= 75 ? "text-green-600" : "text-blue-600"
            } flex-shrink-0 mt-1`}
            size={24}
          />
          <div>
            <h4
              className={`font-semibold ${
                percentage >= 75 ? "text-green-900" : "text-blue-900"
              } mb-2`}
            >
              {percentage >= 90
                ? "Outstanding Work!"
                : percentage >= 75
                ? "Great Job!"
                : percentage >= 50
                ? "Good Effort!"
                : "Keep Practicing!"}
            </h4>
            <p
              className={`${
                percentage >= 75 ? "text-green-800" : "text-blue-800"
              } text-sm`}
            >
              {percentage >= 90
                ? "You have mastered this topic! Consider trying a harder difficulty level."
                : percentage >= 75
                ? "You have a strong understanding. Review the improvement tips to reach excellence."
                : percentage >= 50
                ? "You're on the right track. Focus on the areas mentioned in the improvement tips."
                : "Don't give up! Review the material and try again. Practice makes perfect."}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleReviewQuiz}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <BookOpen size={20} />
          <span>Review Quiz</span>
        </button>
        <button
          onClick={clearCurrentQuiz}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <Home size={20} />
          <span>Generate New Quiz</span>
        </button>
      </div>

      {/* Share Results (Optional) */}
      <div className="text-center text-gray-600 text-sm">
        <p>
          Want to challenge yourself more? Try a different subject or increase
          the difficulty!
        </p>
      </div>
    </div>
  );
};

export default QuizResults;
