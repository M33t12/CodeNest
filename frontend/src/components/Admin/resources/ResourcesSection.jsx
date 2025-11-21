// components/admin/ResourcesSection.jsx - Enhanced with AI Analysis Features
import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, 
  Filter, 
  Search, 
  Bot, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Brain,
  TrendingUp,
  Activity,
  Loader2,
  BarChart3,
  FileX,
  Zap,
  Settings,
  Download
} from "lucide-react";
import AdminResourceCard from "./AdminResourceCard";
import { useAdminStore } from "../../../store/adminStore";

export const ResourcesSection = () => {
  // State management
  const [statusFilter, setStatusFilter] = useState("all");
  const [aiStatusFilter, setAiStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingResource, setRejectingResource] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAIStats, setShowAIStats] = useState(false);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);

  // Store hooks
  const { 
    adminResources, 
    pendingResources, 
    aiModerationStats,
    isLoading, 
    isAnalyzing,
    error,
    fetchAdminResources,
    fetchPendingResources,
    fetchAIModerationAnalytics,
    approveResource,
    rejectResource,
    analyzeResource,
    reAnalyzeResource,
    batchAnalyzeResources,
    getResourcesNeedingAnalysis,
    getResourcesReadyForDecision
  } = useAdminStore();

  // Load resources on component mount and filter changes
  useEffect(() => {
    const filters = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (aiStatusFilter !== 'all') filters.aiStatus = aiStatusFilter;
    if (typeFilter !== 'all') filters.type = typeFilter;
    
    fetchAdminResources(filters);
    fetchPendingResources(aiStatusFilter === 'all' ? 'all' : aiStatusFilter);
    fetchAIModerationAnalytics();
  }, [statusFilter, aiStatusFilter, typeFilter]);

  // Combine and filter resources
  const filteredResources = useMemo(() => {
    let resources = [...(adminResources || []), ...(pendingResources?.resources || [])];
    
    // Remove duplicates
    resources = resources.filter((resource, index, self) =>
      index === self.findIndex(r => r._id === resource._id)
    );

    // Apply search filter
    if (searchTerm) {
      resources = resources.filter((resource) => 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.uploadedBy?.firstName + " " + resource.uploadedBy?.lastName)
          .toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return resources;
  }, [adminResources, pendingResources, searchTerm]);

  // Get category stats
  const getStats = () => {
    const allResources = [...(adminResources || []), ...(pendingResources?.resources || [])];
    const uniqueResources = allResources.filter((resource, index, self) =>
      index === self.findIndex(r => r._id === resource._id)
    );

    return {
      total: uniqueResources.length,
      pending: uniqueResources.filter(r => r.status === 'pending').length,
      approved: uniqueResources.filter(r => r.status === 'approved').length,
      rejected: uniqueResources.filter(r => r.status === 'rejected').length,
      needingAnalysis: uniqueResources.filter(r => 
        !r.aiAnalyzedAt || r.aiVerdict === 'unknown' || r.aiConfidence === 0
      ).length,
      readyForDecision: uniqueResources.filter(r => 
        r.status === 'pending' && r.aiAnalyzedAt && r.aiVerdict !== 'unknown'
      ).length,
      aiApproved: uniqueResources.filter(r => r.aiVerdict === 'approve').length,
      aiRejected: uniqueResources.filter(r => r.aiVerdict === 'reject').length,
    };
  };

  const stats = getStats();

  // Handle actions
  const handleApprove = async (resourceId, options = {}) => {
    try {
      await approveResource(resourceId, options);
      refreshData();
    } catch (error) {
      console.error("Failed to approve resource:", error);
    }
  };

  const handleReject = async () => {
    if (rejectingResource && rejectReason.trim()) {
      try {
        await rejectResource(rejectingResource._id, rejectReason, {
          adminNotes: `Rejected by admin: ${rejectReason}`,
          deleteFiles: false // Could be made configurable
        });
        setShowRejectModal(false);
        setRejectingResource(null);
        setRejectReason("");
        refreshData();
      } catch (error) {
        console.error("Failed to reject resource:", error);
      }
    }
  };

  const handleAnalyze = async (resourceId) => {
    try {
      await analyzeResource(resourceId);
      refreshData();
    } catch (error) {
      console.error("Failed to analyze resource:", error);
    }
  };

  const handleReAnalyze = async (resourceId) => {
    try {
      await reAnalyzeResource(resourceId);
      refreshData();
    } catch (error) {
      console.error("Failed to re-analyze resource:", error);
    }
  };

  const handleBatchAnalyze = async () => {
    const needingAnalysis = getResourcesNeedingAnalysis();
    if (needingAnalysis.length === 0) return;

    setBatchAnalyzing(true);
    try {
      const resourceIds = needingAnalysis.map(r => r._id);
      await batchAnalyzeResources(resourceIds);
      refreshData();
    } catch (error) {
      console.error("Failed to batch analyze:", error);
    } finally {
      setBatchAnalyzing(false);
    }
  };

  const refreshData = () => {
    const filters = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (aiStatusFilter !== 'all') filters.aiStatus = aiStatusFilter;
    if (typeFilter !== 'all') filters.type = typeFilter;
    
    fetchAdminResources(filters);
    fetchPendingResources(aiStatusFilter === 'all' ? 'all' : aiStatusFilter);
    fetchAIModerationAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
          <p className="text-gray-600 mt-1">Review and manage user-submitted resources with AI assistance</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          {stats.needingAnalysis > 0 && (
            <button
              onClick={handleBatchAnalyze}
              disabled={batchAnalyzing || isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {batchAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Analyze All ({stats.needingAnalysis})</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAIStats(!showAIStats)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>AI Stats</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Basic Stats */}
        <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* AI-specific Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.needingAnalysis}</div>
              <div className="text-sm text-gray-600">Need Analysis</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.readyForDecision}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.aiApproved}</div>
              <div className="text-sm text-gray-600">AI Approved</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.aiRejected}</div>
              <div className="text-sm text-gray-600">AI Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Moderation Stats Panel */}
      {showAIStats && aiModerationStats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>AI Moderation Analytics</span>
            </h3>
            <button
              onClick={() => setShowAIStats(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Analysis Completion Rate */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {aiModerationStats.summary?.analysisCompletionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Analysis Completion</div>
            </div>

            {/* Verdict Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Verdicts</h4>
              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Approve:</span>
                  <span className="font-medium text-green-600">
                    {aiModerationStats.verdictDistribution?.approve || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reject:</span>
                  <span className="font-medium text-red-600">
                    {aiModerationStats.verdictDistribution?.reject || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Neutral:</span>
                  <span className="font-medium text-yellow-600">
                    {aiModerationStats.verdictDistribution?.neutral || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Activity */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Top Analyzers</h4>
              <div className="space-y-1 text-sm">
                {aiModerationStats.adminActivity?.slice(0, 3).map((admin, index) => (
                  <div key={admin.adminId} className="flex justify-between">
                    <span className="truncate">{admin.adminName}</span>
                    <span className="font-medium text-blue-600">{admin.analysisCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
              <div className="space-y-1 text-sm text-gray-800">
                {aiModerationStats.commonIssues?.slice(0, 3).map((issue, index) => (
                  <div key={issue.issue} className="flex justify-between">
                    <span className="truncate">{issue.issue}</span>
                    <span className="font-medium text-red-600">{issue.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 text-gray-800 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* AI Status Filter */}
          <select
            value={aiStatusFilter}
            onChange={(e) => setAiStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All AI Status</option>
            <option value="awaiting-ai">Awaiting Analysis</option>
            <option value="ai-analyzed">AI Analyzed</option>
            <option value="ready-for-decision">Ready for Decision</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="link">Link</option>
            <option value="blog">Blog</option>
            <option value="markdown">Markdown</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        {/* Advanced Filters - AI Specific */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-medium text-gray-700">Quick Filters:</span>
              <button
                onClick={() => {
                  setStatusFilter('pending');
                  setAiStatusFilter('awaiting-ai');
                }}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
              >
                Need AI Analysis ({stats.needingAnalysis})
              </button>
              <button
                onClick={() => {
                  setStatusFilter('pending');
                  setAiStatusFilter('ready-for-decision');
                }}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                Ready for Decision ({stats.readyForDecision})
              </button>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setAiStatusFilter('all');
                  setTypeFilter('all');
                  setSearchTerm('');
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredResources.length} of {stats.total} resources
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {stats.needingAnalysis > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {stats.needingAnalysis} resources need AI analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Run AI analysis to get recommendations before making decisions
                </p>
              </div>
            </div>
            <button
              onClick={handleBatchAnalyze}
              disabled={batchAnalyzing || isAnalyzing}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {batchAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Analyze All Resources</span>
                </>
              )}
            </button>
          </div>

          {batchAnalyzing && (
            <div className="mt-3 bg-white bg-opacity-50 rounded p-3">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Activity className="w-4 h-4" />
                <span>Processing AI analysis in background...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
      )}

      {/* Resources List */}
      {!isLoading && (
        <div className="space-y-6">
          {filteredResources.map((resource) => (
            <AdminResourceCard
              key={resource._id}
              resource={resource}
              onApprove={handleApprove}
              onReject={(res) => {
                setRejectingResource(res);
                setShowRejectModal(true);
              }}
              onAnalyze={handleAnalyze}
              onReAnalyze={handleReAnalyze}
              isAnalyzing={isAnalyzing}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <div className="text-xl font-semibold text-gray-900 mb-2">No resources found</div>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || aiStatusFilter !== 'all'
              ? "Try adjusting your filters to see more resources"
              : "No resources have been submitted yet"}
          </p>
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || aiStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
                setAiStatusFilter("all");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Enhanced Reject Modal */}
      {showRejectModal && rejectingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-gray-700">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-6">
                <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">Reject Resource</h2>
                  <p className="text-gray-600 mt-1">
                    You are about to reject "{rejectingResource.name}"
                  </p>
                </div>
              </div>

              {/* Resource Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Subject:</span>
                    <span className="ml-2">{rejectingResource.subject}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 capitalize">{rejectingResource.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Uploaded by:</span>
                    <span className="ml-2">
                      {rejectingResource.uploadedBy?.firstName} {rejectingResource.uploadedBy?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Upload Date:</span>
                    <span className="ml-2">
                      {new Date(rejectingResource.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Display */}
              {rejectingResource.aiVerdict === 'reject' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bot className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">AI Recommendation: REJECT</span>
                    <span className="text-sm text-red-600">
                      ({Math.round(rejectingResource.aiConfidence * 100)}% confidence)
                    </span>
                  </div>
                  {rejectingResource.aiFeedback && (
                    <p className="text-sm text-red-700 mb-3">{rejectingResource.aiFeedback}</p>
                  )}
                  {rejectingResource.aiIssues?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-2">Issues identified:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {rejectingResource.aiIssues.map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-3 h-3 text-red-600 mt-1 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason * <span className="text-red-500">Required</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a clear, constructive reason for rejection. This will be visible to the resource uploader to help them understand what needs improvement."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    Minimum 10 characters required
                  </div>
                  <div className="text-xs text-gray-500">
                    {rejectReason.length}/500 characters
                  </div>
                </div>
              </div>

              {/* Suggested reasons based on AI analysis */}
              {rejectingResource.aiIssues?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick suggestions based on AI analysis:</p>
                  <div className="space-y-2">
                    {rejectingResource.aiIssues.slice(0, 3).map((issue, index) => (
                      <button
                        key={index}
                        onClick={() => setRejectReason(
                          `${rejectReason ? rejectReason + '. ' : ''}This resource has been flagged for: ${issue}.`
                        )}
                        className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm transition-colors"
                      >
                        Add: "{issue}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingResource(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || rejectReason.length < 10}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Resource</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ResourcesSection;