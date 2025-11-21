// [QuizReview.jsx] - NEW FILE

import React, { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Clock,
  Lightbulb,
  RefreshCw,
  Home,
  CheckCircle,
  XCircle,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useAIStore } from "../../store/aiStore";

const QuizReview = () => {
  const { quizReview, clearCurrentQuiz, reAttemptQuiz, setLoading } =
    useAIStore();
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  if (!quizReview || !quizReview.quiz || !quizReview.submission) return null;

  const { quiz, submission } = quizReview;
  const totalQuestions = quiz.questions.length;
  const score = submission.score;
  const percentage = Math.round((score / totalQuestions) * 100);
  const hintsUsed = submission.hintRequests?.length || 0;

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: "Excellent", color: "green" };
    if (percentage >= 75) return { level: "Good", color: "blue" };
    if (percentage >= 50) return { level: "Fair", color: "yellow" };
    return { level: "Needs Improvement", color: "red" };
  };
  const performance = getPerformanceLevel();

  const handleRetake = async () => {
    try {
      setLoading(true);
      // await reAttemptQuiz(quiz._id) correctly sets currentQuiz and clears quizReview
      await reAttemptQuiz(quiz._id);

      // ❌ REMOVED: clearCurrentQuiz();
      // Calling it here would immediately set currentQuiz back to null,
      // stopping the QuizPlayer from launching.
    } catch (error) {
      console.error("Failed to re-attempt quiz:", error);
      setLoading(false);
    }
  };

  const getQuestionResult = (question) => {
    const userResponse = submission.responses.find(
      (r) => r.questionId.toString() === question._id.toString()
    );
    const hint = submission.hintRequests.find(
      (h) => h.questionId.toString() === question._id.toString()
    );

    return {
      isCorrect: userResponse?.isCorrect,
      userAnswer: userResponse?.userResponse,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: hint?.hint,
    };
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-1">Review: {quiz.title}</h2>
        <div className="text-xl opacity-90 mb-4">
          <span className="font-bold">
            {score}/{totalQuestions}
          </span>{" "}
          Correct ({percentage}%)
        </div>
        <div
          className={`inline-block px-6 py-2 text-gray-700 bg-white bg-opacity-20 rounded-full text-lg font-semibold`}
        >
          {performance.level} Performance
        </div>
      </div>

      {/* Improvement Tips (from QuizResults) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">
            AI-Powered Improvement Tips
          </h3>
        </div>
        <div className="space-y-3">
          {submission.aiSummary?.length > 0 ? (
            submission.aiSummary.map((tip, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-800">{tip}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              Great job! No specific tips generated, but always room to learn
              more.
            </p>
          )}
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 border-b pb-2">
          Question Breakdown
        </h3>
        {quiz.questions.map((question, index) => {
          const result = getQuestionResult(question);
          const isExpanded = expandedQuestionId === question._id.toString();

          return (
            <div
              key={question._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className={`p-5 cursor-pointer flex items-center justify-between transition-colors ${
                  result.isCorrect === true
                    ? "bg-green-50 hover:bg-green-100"
                    : result.isCorrect === false
                    ? "bg-red-50 hover:bg-red-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() =>
                  setExpandedQuestionId(
                    isExpanded ? null : question._id.toString()
                  )
                }
              >
                <div className="flex items-center space-x-3">
                  {result.isCorrect === true ? (
                    <CheckCircle
                      className="text-green-600 flex-shrink-0"
                      size={20}
                    />
                  ) : result.isCorrect === false ? (
                    <XCircle className="text-red-600 flex-shrink-0" size={20} />
                  ) : (
                    <BookOpen
                      className="text-gray-600 flex-shrink-0"
                      size={20}
                    />
                  )}
                  <span className="font-semibold text-gray-800">
                    Q{index + 1}: {question.questionText}
                  </span>
                </div>
                <ChevronDown
                  className={`text-gray-600 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-gray-200 space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    Your Answer:{" "}
                    <span
                      className={`font-bold ${
                        result.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.userAnswer || "No Answer"}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    Correct Answer:{" "}
                    <span className="font-bold text-green-600">
                      {result.correctAnswer}
                    </span>
                  </p>

                  {result.explanation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Explanation
                      </h4>
                      <p className="text-sm text-blue-800">
                        {result.explanation}
                      </p>
                    </div>
                  )}

                  {result.hint && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        Hint Used
                      </h4>
                      <p className="text-sm text-yellow-800">{result.hint}</p>
                    </div>
                  )}

                  {/* Display all options for context */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                      All Options:
                    </h4>
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`text-sm p-2 rounded-md ${
                            option === result.correctAnswer
                              ? "bg-green-100 font-bold text-green-800"
                              : option === result.userAnswer &&
                                !result.isCorrect
                              ? "bg-red-100 font-bold text-red-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {option}
                          {option === result.correctAnswer && " (Correct)"}
                          {option === result.userAnswer &&
                            !result.isCorrect &&
                            " (Your Incorrect Answer)"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleRetake} // This now correctly relies on the state change in aiStore
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <RefreshCw size={20} />
          <span>Retake Quiz</span>
        </button>
        <button
          onClick={clearCurrentQuiz} // This button's logic remains correct
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <Home size={20} />
          <span>Generate New Quiz</span>
        </button>
      </div>
    </div>
  );
};

export default QuizReview;
