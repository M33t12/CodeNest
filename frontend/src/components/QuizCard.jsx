import React from 'react';
import { BookOpen, Clock, Target, Calendar, Trophy } from 'lucide-react';

const QuizCard = ({ quiz, showScore = false, onStart, onReAttempt }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'HARD':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const percentage = showScore && quiz.score !== undefined && quiz.totalQuestions
    ? Math.round((quiz.score / quiz.totalQuestions) * 100)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{quiz.title}</h3>
        <div className="flex items-center space-x-2 text-sm opacity-90">
          <BookOpen size={14} />
          <span>{quiz.subject}</span>
          {quiz.topic && (
            <>
              <span>•</span>
              <span className="line-clamp-1">{quiz.topic}</span>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Difficulty Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          {showScore && percentage !== null && (
            <div className="flex items-center space-x-1">
              <Trophy className="text-yellow-500" size={16} />
              <span className="font-bold text-gray-900">{percentage}%</span>
            </div>
          )}
        </div>

        {/* Quiz Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Target className="text-blue-500" size={16} />
            <span>{quiz.totalQuestions} Questions</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="text-green-500" size={16} />
            <span>{quiz.timeLimit || 10} minutes</span>
          </div>

          {quiz.createdAt && (
            <div className="flex items-center space-x-2">
              <Calendar className="text-purple-500" size={16} />
              <span>
                {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Score Display */}
        {showScore && quiz.score !== undefined && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Your Score:</span>
              <span className="font-bold text-gray-900">
                {quiz.score} / {quiz.totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          {onStart && (
            <button
              onClick={onStart}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Quiz
            </button>
          )}
          {onReAttempt && (
            <button
              onClick={onReAttempt}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;