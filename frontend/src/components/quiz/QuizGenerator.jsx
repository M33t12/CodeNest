import React, { useState } from 'react';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const QuizGenerator = () => {
  const { generateQuiz, isLoading, error, clearError } = useAIStore();
  
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    subject: '',
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    timeLimit: 10
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!quizConfig.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (quizConfig.numberOfQuestions < 5 || quizConfig.numberOfQuestions > 20) {
      newErrors.numberOfQuestions = 'Number of questions must be between 5 and 20';
    }
    
    if (quizConfig.timeLimit < 5 || quizConfig.timeLimit > 60) {
      newErrors.timeLimit = 'Time limit must be between 5 and 60 minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await generateQuiz(quizConfig);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setQuizConfig({ ...quizConfig, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <Brain className="text-blue-600" size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">
          AI Quiz Generator
        </h2>
        
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate personalized quizzes on any subject with AI-powered questions tailored to your difficulty level
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Quiz Configuration Form */}
      <form onSubmit={handleGenerateQuiz} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Sparkles className="text-blue-600" size={24} />
          <span>Quiz Configuration</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title (Optional)
            </label>
            <input
              type="text"
              value={quizConfig.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Advanced JavaScript Quiz"
              className="w-full px-4 py-3 border  text-gray-700  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={quizConfig.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="e.g., Mathematics, Physics, Programming"
              className={`w-full px-4 py-3 border rounded-lg  text-gray-700  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subject && (
              <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic (Optional)
            </label>
            <input
              type="text"
              value={quizConfig.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="e.g., Async/Await, Calculus, Thermodynamics"
              className="w-full px-4 py-3 border  text-gray-700  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <select
              value={quizConfig.numberOfQuestions}
              onChange={(e) => handleInputChange('numberOfQuestions', parseInt(e.target.value))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2  text-gray-700  focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.numberOfQuestions ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
            {errors.numberOfQuestions && (
              <p className="text-red-600 text-sm mt-1">{errors.numberOfQuestions}</p>
            )}
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={quizConfig.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 border  text-gray-700  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="easy">Easy - Beginner Level</option>
              <option value="medium">Medium - Intermediate Level</option>
              <option value="hard">Hard - Advanced Level</option>
            </select>
          </div>

          {/* Time Limit */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={quizConfig.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
              className={`w-full px-4 py-3  text-gray-700  border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.timeLimit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.timeLimit && (
              <p className="text-red-600 text-sm mt-1">{errors.timeLimit}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 1 minute per question
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Brain size={20} />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Brain className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-sm">
            Questions generated using advanced AI to match your skill level
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning</h3>
          <p className="text-gray-600 text-sm">
            Difficulty adjusts based on your past performance
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Instant Feedback</h3>
          <p className="text-gray-600 text-sm">
            Get detailed explanations and improvement tips after completion
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;