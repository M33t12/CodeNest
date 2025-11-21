import React, { useEffect } from 'react';
import { Trophy, TrendingUp, Lightbulb, Target, CheckCircle, XCircle, Home, BarChart3 } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';

const InterviewFeedback = () => {
  const { feedback, clearCurrentInterview, clearFeedback } = useInterviewStore();

  useEffect(() => {
    console.log('InterviewFeedback mounted with feedback:', feedback);
  }, [feedback]);

  // If no feedback is available, show a message instead of returning null
  if (!feedback) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Trophy size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Feedback Available</h2>
        <p className="text-gray-600 mb-6">
          Complete an interview to see your feedback here.
        </p>
        <button
          onClick={() => {
            clearFeedback();
            clearCurrentInterview();
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  const { performanceMetrics, feedback: finalFeedback, duration, totalQuestions } = feedback;

  // Validate that we have the required data
  if (!performanceMetrics || !finalFeedback) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-600">Error loading feedback data. Please try again.</p>
        <button
          onClick={() => {
            clearFeedback();
            clearCurrentInterview();
          }}
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  const handleStartNew = () => {
    clearFeedback();
    clearCurrentInterview();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getConfidenceBadge = (level) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const metrics = [
    { 
      label: 'Technical Accuracy', 
      value: performanceMetrics.technicalAccuracy || 0, 
      icon: Target,
      color: 'blue'
    },
    { 
      label: 'Communication Skills', 
      value: performanceMetrics.communicationSkills || 0, 
      icon: TrendingUp,
      color: 'green'
    },
    { 
      label: 'Problem Solving', 
      value: performanceMetrics.problemSolving || 0, 
      icon: Lightbulb,
      color: 'purple'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-8 text-center shadow-xl">
        <Trophy size={64} className="mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
        <p className="text-blue-100 text-lg">Here's your comprehensive performance report</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className={`bg-white rounded-xl p-6 shadow-md border-l-4 ${
          performanceMetrics.overallScore >= 80 ? 'border-green-500' :
          performanceMetrics.overallScore >= 60 ? 'border-yellow-500' : 'border-red-500'
        }`}>
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-2" size={24} />
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(performanceMetrics.overallScore)}`}>
              {performanceMetrics.overallScore}%
            </div>
            <p className="text-gray-600 font-medium">Overall Score</p>
          </div>
        </div>
        
        {/* Questions Answered */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
          <div className="text-center">
            <CheckCircle className="mx-auto text-gray-400 mb-2" size={24} />
            <div className="text-5xl font-bold text-blue-600 mb-2">{totalQuestions || 0}</div>
            <p className="text-gray-600 font-medium">Questions Answered</p>
          </div>
        </div>
        
        {/* Interview Duration */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-indigo-500">
          <div className="text-center">
            <Trophy className="mx-auto text-gray-400 mb-2" size={24} />
            <div className="text-5xl font-bold text-indigo-600 mb-2">{formatDuration(duration)}</div>
            <p className="text-gray-600 font-medium">Interview Duration</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="mr-2 text-blue-600" size={24} />
          Performance Breakdown
        </h3>
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                    <span className="font-medium text-gray-700">{metric.label}</span>
                  </div>
                  <span className={`font-bold text-lg ${getScoreColor(metric.value)}`}>
                    {metric.value}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Confidence Level */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Confidence Level</span>
            <span className={`px-4 py-2 rounded-full font-medium capitalize text-sm ${getConfidenceBadge(performanceMetrics.confidenceLevel)}`}>
              {performanceMetrics.confidenceLevel || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Feedback */}
      {finalFeedback.textFeedback && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Feedback</h3>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {finalFeedback.textFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Strengths */}
      {finalFeedback.strengths && finalFeedback.strengths.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-600" size={24} />
            Your Strengths
          </h3>
          <ul className="space-y-3">
            {finalFeedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-3 group">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {finalFeedback.improvements && finalFeedback.improvements.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-orange-600" size={24} />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {finalFeedback.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-3 group">
                <XCircle className="text-orange-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {finalFeedback.recommendations && finalFeedback.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-600" size={24} />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {finalFeedback.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3 group">
                <Lightbulb className="text-yellow-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4 pt-4 pb-12">
        <button
          onClick={handleStartNew}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Home size={22} />
          <span>Start New Interview</span>
        </button>
      </div>
    </div>
  );
};

export default InterviewFeedback;