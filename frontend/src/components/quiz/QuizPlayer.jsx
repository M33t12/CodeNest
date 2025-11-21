import React, { useState, useEffect } from 'react';
import { Clock, Lightbulb, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const QuizPlayer = () => {
  const { 
    currentQuiz, 
    submitQuiz, 
    getQuestionHint, 
    hintRequests,
    isLoading,
    clearCurrentQuiz 
  } = useAIStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showHintFor, setShowHintFor] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialize timer when quiz loads or changes
  useEffect(() => {
    if (currentQuiz) {
      const initialTime = (currentQuiz.timeLimit || 10) * 60;
      setTimeRemaining(initialTime);
      setStartTime(Date.now());
      setAnswers({});
      setCurrentQuestionIndex(0);
      setHasSubmitted(false);
    }
  }, [currentQuiz?._id]); // Reset when quiz ID changes

  // Timer with auto-submit prevention
  useEffect(() => {
    if (hasSubmitted || timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        // Only trigger submit when reaching 0, not continuously
        if (newTime === 0 && !hasSubmitted) {
          handleSubmitQuiz();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasSubmitted]);

  if (!currentQuiz) return null;

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion._id]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHintFor(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHintFor(null);
    }
  };

  const handleRequestHint = async () => {
    setLoadingHint(true);
    try {
      await getQuestionHint(currentQuiz._id, currentQuestion._id);
      setShowHintFor(currentQuestion._id);
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds
    
    const responses = currentQuiz.questions.map((q) => ({
      questionId: q._id,
      userResponse: answers[q._id] || ''
    }));

    try {
      await submitQuiz(currentQuiz._id, responses, timeTaken);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleCancelQuiz = () => {
    // 1. Confirmation dialog
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel the quiz? Your progress will be lost."
    );

    // 2. Clear state on confirmation
    if (confirmCancel) {
      clearCurrentQuiz(); // This resets currentQuiz to null, returning to QuizGenerator
    }
  };

  const answeredCount = Object.keys(answers).length;
  const currentHint = hintRequests.find(h => h.questionId === currentQuestion._id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h2>
            <p className="text-gray-600">
              {currentQuiz.subject} {currentQuiz.topic && `- ${currentQuiz.topic}`}
            </p>
          </div>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock size={20} />
            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>Answered: {answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1}
            </span>
            
            <button
              onClick={handleRequestHint}
              disabled={loadingHint || currentHint}
              className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lightbulb size={20} />
              <span className="text-sm font-medium">
                {currentHint ? 'Hint Used' : 'Request Hint'}
              </span>
            </button>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.questionText}
          </h3>

          {/* Hint Display */}
          {showHintFor === currentQuestion._id && currentHint && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Hint</h4>
                <p className="text-yellow-800 text-sm">{currentHint.hint}</p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 text-gray-700">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion._id] === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle size={16} className="text-white" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          {/* NEW: Cancel Quiz Button */}
          <button
            onClick={handleCancelQuiz}
            className="px-6 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel Quiz
          </button>
          
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium"
              >
                <Send size={18} />
                <span>{isLoading ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Question Navigator</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {currentQuiz.questions.map((q, index) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={q._id}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowHintFor(null);
                }}
                className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exit Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-semibold text-amber-900 mb-1">Important</h4>
          <p className="text-amber-800 text-sm">
            Make sure to answer all questions before time runs out. You can navigate between questions and change your answers before submitting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;