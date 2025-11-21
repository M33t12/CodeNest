// / components/DSAQuestionCard.jsx
import React from 'react';
import { ExternalLink, CheckCircle, Circle, Clock } from 'lucide-react';
import { useDSAStore } from '../store/dsaStore';

const DSAQuestionCard = ({ question, userStatus = 'unsolved' }) => {
  const { updateQuestionStatus } = useDSAStore();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'attempted': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateQuestionStatus(question._id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openLeetCode = () => {
    if (question.leetcodeUrl) {
      window.open(question.leetcodeUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(userStatus)}
            <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">{question.topic}</span>
          </div>

          {question.tags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {question.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {question.leetcodeUrl && (
          <button
            onClick={openLeetCode}
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={20} />
          </button>
        )}
      </div>

      {question.description && (
        <p className="text-gray-700 mb-4 line-clamp-3">{question.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange('attempted')}
            className={`px-3 py-1 rounded text-sm ${
              userStatus === 'attempted'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Attempted
          </button>
          <button
            onClick={() => handleStatusChange('solved')}
            className={`px-3 py-1 rounded text-sm ${
              userStatus === 'solved'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Solved
          </button>
        </div>

        {question.companies && question.companies.length > 0 && (
          <div className="text-sm text-gray-500">
            Asked by: {question.companies.slice(0, 2).join(', ')}
            {question.companies.length > 2 && ' +more'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAQuestionCard;
