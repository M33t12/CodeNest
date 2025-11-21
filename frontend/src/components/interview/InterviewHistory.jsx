import React, { useEffect, useState } from 'react';
import { Clock, Calendar, MessageSquare, TrendingUp, Eye, Filter, X, Trophy, Target, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';

const InterviewHistory = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { interviewHistory, isLoading, fetchInterviewHistory } = useInterviewStore();

  useEffect(() => {
    // const userId = localStorage.getItem('userId') || 'default-user';
    fetchInterviewHistory({ status: statusFilter });
    console.log("Interview History :",interviewHistory)
  }, [ statusFilter]);

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      initialized: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.initialized;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedInterview(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
          <p className="text-gray-600 mt-1">Review your past interviews and track your progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Interview List */}
      {interviewHistory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Interviews Yet</h3>
          <p className="text-gray-600">
            Start your first AI interview to see your history here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviewHistory.map((interview) => (
            <div
              key={interview._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{interview.topic}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        interview.status
                      )}`}
                    >
                      {interview.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {interview.interviewType} Interview
                  </p>
                </div>
                {interview.performanceMetrics?.overallScore && (
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(interview.performanceMetrics.overallScore)}`}>
                      {interview.performanceMetrics.overallScore}%
                    </div>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{formatDate(interview.startTime)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{formatDuration(interview.duration)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span>{interview.questionsAsked?.length || 0} Questions</span>
                </div>
                {interview.performanceMetrics?.confidenceLevel && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="capitalize">{interview.performanceMetrics.confidenceLevel} Confidence</span>
                  </div>
                )}
              </div>

              {interview.status === 'completed' && interview.performanceMetrics && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Technical Accuracy</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${interview.performanceMetrics.technicalAccuracy}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {interview.performanceMetrics.technicalAccuracy}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Communication</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${interview.performanceMetrics.communicationSkills}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {interview.performanceMetrics.communicationSkills}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Problem Solving</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${interview.performanceMetrics.problemSolving}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {interview.performanceMetrics.problemSolving}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(interview)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <Eye size={16} />
                    <span>View Detailed Feedback</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detailed Feedback Modal */}
      {showDetailModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex justify-between items-start rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedInterview.topic}</h2>
                <p className="text-blue-100 text-sm capitalize">
                  {selectedInterview.interviewType} Interview - {formatDate(selectedInterview.startTime)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <Trophy className="mx-auto text-blue-600 mb-2" size={32} />
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(selectedInterview.performanceMetrics.overallScore)}`}>
                    {selectedInterview.performanceMetrics.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <MessageSquare className="mx-auto text-green-600 mb-2" size={32} />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {selectedInterview.questionsAsked?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <Clock className="mx-auto text-purple-600 mb-2" size={32} />
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {formatDuration(selectedInterview.duration)}
                  </div>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2 text-blue-600" size={20} />
                  Performance Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Technical Accuracy', value: selectedInterview.performanceMetrics.technicalAccuracy, color: 'blue' },
                    { label: 'Communication Skills', value: selectedInterview.performanceMetrics.communicationSkills, color: 'green' },
                    { label: 'Problem Solving', value: selectedInterview.performanceMetrics.problemSolving, color: 'purple' }
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 text-sm">{metric.label}</span>
                        <span className={`font-bold ${getScoreColor(metric.value)}`}>
                          {metric.value}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full bg-${metric.color}-500 rounded-full transition-all`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Confidence Level</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    selectedInterview.performanceMetrics.confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
                    selectedInterview.performanceMetrics.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedInterview.performanceMetrics.confidenceLevel}
                  </span>
                </div>
              </div>

              {/* Detailed Feedback */}
              {selectedInterview.finalFeedback?.textFeedback && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Detailed Feedback</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedInterview.finalFeedback.textFeedback}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {selectedInterview.finalFeedback?.strengths?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="mr-2 text-green-600" size={20} />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedInterview.finalFeedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {selectedInterview.finalFeedback?.improvements?.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="mr-2 text-orange-600" size={20} />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedInterview.finalFeedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <XCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700 text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedInterview.finalFeedback?.recommendations?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="mr-2 text-yellow-600" size={20} />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {selectedInterview.finalFeedback.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700 text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;