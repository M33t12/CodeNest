import React, { useState, useEffect } from 'react';
import { 
  History, Trophy, Calendar, Filter, Search, 
  TrendingUp, Clock, BookOpen, RefreshCw, ChevronDown 
} from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
// import { Navigate } from 'react-router-dom';

const QuizHistory = ({ onNavigateToQuiz }) => {
  const { quizHistory, fetchQuizHistory, reAttemptQuiz, isLoading } = useAIStore();
  
  const [filters, setFilters] = useState({
    subject: '',
    minScore: '',
    maxScore: '',
    from: '',
    to: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizHistory(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleApplyFilters = () => {
    fetchQuizHistory(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      subject: '',
      minScore: '',
      maxScore: '',
      from: '',
      to: ''
    };
    setFilters(clearedFilters);
    fetchQuizHistory(clearedFilters);
  };

  const handleReAttempt = async (quizId, onNavigate) => {
    try {
      await reAttemptQuiz(quizId);
      // Call the navigation callback if provided
      if (onNavigate) {
        onNavigate();
      }
    } catch (error) {
      console.error('Failed to re-attempt quiz:', error);
    }
  };

  // Filter history based on search term
  const filteredHistory = quizHistory.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.quizDetails?.title?.toLowerCase().includes(searchLower) ||
      item.quizDetails?.subject?.toLowerCase().includes(searchLower) ||
      item.quizDetails?.topic?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalAttempts = quizHistory.length;
  const averageScore = totalAttempts > 0
    ? Math.round(quizHistory.reduce((sum, item) => sum + item.score, 0) / totalAttempts)
    : 0;
  const totalQuestions = quizHistory.reduce(
    (sum, item) => sum + (item.quizDetails?.totalQuestions || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <History size={24} />
            <h3 className="text-lg font-semibold">Total Quiz Attempts</h3>
          </div>
          <p className="text-4xl font-bold">{totalAttempts}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Trophy size={24} />
            <h3 className="text-lg font-semibold">Average Score</h3>
          </div>
          <p className="text-4xl font-bold">{averageScore}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen size={24} />
            <h3 className="text-lg font-semibold">Questions Answered</h3>
          </div>
          <p className="text-4xl font-bold">{totalQuestions}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative text-gray-700">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, subject, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Filter size={20} />
            <span>Filters</span>
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', e.target.value)}
                  className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                <input
                  type="number"
                  placeholder="100"
                  min="0"
                  value={filters.maxScore}
                  onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                  className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleApplyFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <History className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quiz History</h3>
          <p className="text-gray-600">
            {searchTerm || Object.values(filters).some(v => v)
              ? 'No quizzes match your search or filters.'
              : 'Start taking quizzes to see your history here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <QuizHistoryCard 
              key={index} 
              item={item} 
              onReAttempt={() => handleReAttempt(item.quizId, onNavigateToQuiz)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Quiz History Card Component
const QuizHistoryCard = ({ item, onReAttempt }) => {
  const quiz = item.quizDetails;
  const percentage = Math.round((item.score / quiz.totalQuestions) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 90) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  const scoreColor = getScoreColor();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Quiz Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <BookOpen size={14} />
                  <span>{quiz.subject}</span>
                </span>
                {quiz.topic && (
                  <span className="text-gray-400">• {quiz.topic}</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  quiz.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                  quiz.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {quiz.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center space-x-2">
              <Trophy className={`text-${scoreColor}-600`} size={16} />
              <span className="text-sm font-medium text-gray-700">
                Score: <span className={`text-${scoreColor}-600 font-bold`}>{item.score}/{quiz.totalQuestions}</span>
                <span className="text-gray-500 ml-1">({percentage}%)</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="text-gray-400" size={16} />
              <span className="text-sm text-gray-600">
                {Math.floor(item.timeTaken / 60)}:{(item.timeTaken % 60).toString().padStart(2, '0')} min
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-400" size={16} />
              <span className="text-sm text-gray-600">
                {new Date(item.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {item.hintRequests && item.hintRequests.length > 0 && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-yellow-600" size={16} />
                <span className="text-sm text-gray-600">
                  {item.hintRequests.length} hint{item.hintRequests.length > 1 ? 's' : ''} used
                </span>
              </div>
            )}
          </div>

          {/* AI Summary */}
          {item.aiSummary && item.aiSummary.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">AI Improvement Tips:</p>
              <ul className="space-y-1">
                {item.aiSummary.slice(0, 2).map((tip, idx) => (
                  <li key={idx} className="text-sm text-blue-800">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex md:flex-col gap-2">
          <button
            onClick={() => onReAttempt(item.quizId)}
            className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <RefreshCw size={18} />
            <span>Retake</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizHistory;