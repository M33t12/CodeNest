// components/admin/AdminResourceCard.jsx - Enhanced with AI Analysis Features
import React, { useState } from "react";
import {
  Star,
  ExternalLink,
  MessageSquare,
  FileIcon,
  FileTextIcon,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  User,
  ImageIcon,
  Code,
  AlertTriangle,
  Bot,
  Shield,
  Loader2,
  Brain,
  TrendingUp,
  Calendar,
  FileX,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Activity
} from "lucide-react";

export const AdminResourceCard = ({ 
  resource, 
  onApprove, 
  onReject, 
  onAnalyze,
  onReAnalyze,
  isAnalyzing = false 
}) => {
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [showApprovalOptions, setShowApprovalOptions] = useState(false);

  
  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon className="w-5 h-5 text-red-600" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case "link":
        return <LinkIcon className="w-5 h-5 text-blue-600" />;
      case "blog":
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case "markdown":
        return <Code className="w-5 h-5 text-orange-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getAIVerdictColor = (verdict) => {
    switch (verdict) {
      case "approve":
        return "text-green-600 bg-green-50";
      case "reject":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getAIVerdictIcon = (verdict) => {
    switch (verdict) {
      case "approve":
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case "reject":
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      case "neutral":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bot className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const needsAIAnalysis = () => {
    return !resource.aiAnalyzedAt || 
           resource.aiVerdict === 'unknown' || 
           resource.aiConfidence === 0;
  };

  const isReadyForDecision = () => {
    return resource.status === 'pending' && 
           resource.aiAnalyzedAt && 
           resource.aiVerdict !== 'unknown';
  };

  const canApproveDirectly = () => {
    return resource.aiVerdict === 'approve' && resource.aiConfidence >= 0.7;
  };

  const shouldShowWarning = () => {
    return resource.aiVerdict === 'reject' && resource.aiConfidence >= 0.7;
  };

  const openResource = () => {
    if (resource.content?.url) {
      window.open(resource.content.url, "_blank");
    }
  };

  const handleApprove = () => {
    const options = {
      overrideAI: resource.aiVerdict === 'reject',
      adminNotes: showApprovalOptions ? "Approved with AI analysis consideration" : undefined
    };
    onApprove(resource._id, options);
    setShowApprovalOptions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getTypeIcon(resource.type)}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {resource.name}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="font-medium">{resource.subject}</span>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>
                    {resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(resource.status)}`}>
              {resource.status.toUpperCase()}
            </span>
            {resource.content?.url && (
              <button
                onClick={openResource}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Open resource"
              >
                <ExternalLink size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Decision Status Indicator */}
        {resource.status === 'pending' && (
          <div className="mb-4">
            {needsAIAnalysis() ? (
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <Brain className="w-4 h-4" />
                <span>Awaiting AI Analysis</span>
              </div>
            ) : isReadyForDecision() ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Activity className="w-4 h-4" />
                <span>Ready for Admin Decision</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Description */}
        {resource.content?.description && (
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            {resource.content.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{resource.averageRating ? resource.averageRating.toFixed(1) : '0.0'}</span>
              <span>({resource.totalRatings || 0})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{resource.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{resource.downloads || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* AI Analysis Section - Enhanced */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Bot className="w-5 h-5 text-blue-600" />
              )}
              <h4 className="font-medium text-gray-900">
                {isAnalyzing ? "Analyzing..." : "AI Analysis"}
              </h4>
            </div>
            
            {resource.aiAnalyzedAt && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(resource.aiAnalyzedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAIDetails(!showAIDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAIDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {/* AI Status Overview */}
        {!isAnalyzing && resource.aiAnalyzedAt ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* Verdict */}
            <div className={`p-3 rounded-lg border ${getAIVerdictColor(resource.aiVerdict)}`}>
              <div className="flex items-center space-x-2">
                {getAIVerdictIcon(resource.aiVerdict)}
                <div>
                  <div className="font-medium text-sm">Verdict</div>
                  <div className="text-xs capitalize">
                    {resource.aiVerdict || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <TrendingUp className={`w-4 h-4 ${getConfidenceColor(resource.aiConfidence)}`} />
                <div>
                  <div className="font-medium text-sm text-gray-800">Confidence</div>
                  <div className={`text-xs font-semibold ${getConfidenceColor(resource.aiConfidence)}`}>
                    {resource.aiConfidence ? `${Math.round(resource.aiConfidence * 100)}%` : '0%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Count */}
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="font-medium text-sm text-gray-800">Issues</div>
                  <div className="text-xs text-gray-600">
                    {resource.aiIssues?.length || 0} found
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !isAnalyzing ? (
          <div className="text-center py-4 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI analysis available</p>
          </div>
        ) : null}

        {/* Detailed AI Analysis */}
        {showAIDetails && resource.aiAnalyzedAt && (
          <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border">
            {/* AI Feedback */}
            {resource.aiFeedback && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Feedback</span>
                </h5>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 leading-relaxed">
                  {resource.aiFeedback}
                </div>
              </div>
            )}

            {/* Issues Identified */}
            {resource.aiIssues && resource.aiIssues.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Issues Identified</span>
                </h5>
                <div className="space-y-2">
                  {resource.aiIssues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {resource.aiRecommendations && resource.aiRecommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Recommendations</span>
                </h5>
                <div className="space-y-2">
                  {resource.aiRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Analyzed by: {resource.aiAnalyzedBy?.firstName} {resource.aiAnalyzedBy?.lastName} 
                </span>
                <span>{new Date(resource.aiAnalyzedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason */}
      {resource.status === "rejected" && resource.rejectionReason && (
        <div className="p-4 bg-red-50 border-b border-gray-200">
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Rejection Reason</h4>
              <p className="text-sm text-red-800">{resource.rejectionReason}</p>
              {resource.adminNotes && (
                <p className="text-xs text-red-700 mt-2">
                  <strong>Admin Notes:</strong> {resource.adminNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons for Pending Resources */}
      {resource.status === "pending" && (
        <div className="p-4 bg-gray-50">
          {/* AI Analysis Actions */}
          {needsAIAnalysis() ? (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      AI Analysis Required
                    </p>
                    <p className="text-xs text-orange-700">
                      This resource needs to be analyzed before approval
                    </p>
                  </div>
                </div>
                {onAnalyze && (
                  <button
                    onClick={() => onAnalyze(resource._id)}
                    disabled={isAnalyzing}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isAnalyzing ? "Analyzing..." : "Analyze Now"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Show warning if AI recommends rejection */
            shouldShowWarning() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      AI Recommends Rejection
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      High confidence ({Math.round(resource.aiConfidence * 100)}%) that this resource should be rejected.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Decision Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onReject && (
                <button
                  onClick={() => onReject(resource)}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
              )}

              {onApprove && (
                <div className="relative">
                  {/* Simple Approve Button or Options */}
                  {canApproveDirectly() && !showApprovalOptions ? (
                    <button
                      onClick={handleApprove}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                      {resource.aiVerdict === 'approve' && (
                        <Bot className="w-3 h-3 opacity-70" />
                      )}
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => setShowApprovalOptions(!showApprovalOptions)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          shouldShowWarning() 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span>
                          {shouldShowWarning() ? 'Override & Approve' : 'Approve'}
                        </span>
                      </button>
                      
                      {showApprovalOptions && (
                        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-3 z-10 min-w-64">
                          <div className="space-y-2 text-gray-800">
                            <p className="text-xs text-gray-900 font-medium">Approval Options</p>
                            {shouldShowWarning() && (
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                Warning: AI recommends rejection with {Math.round(resource.aiConfidence * 100)}% confidence
                              </div>
                            )}
                            <button
                              onClick={handleApprove}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                            >
                              {shouldShowWarning() ? 'Override AI & Approve' : 'Standard Approval'}
                            </button>
                            <button
                              onClick={() => setShowApprovalOptions(false)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Re-analyze and Additional Actions */}
            <div className="flex items-center space-x-2">
              {resource.aiAnalyzedAt && onReAnalyze && (
                <button
                  onClick={() => onReAnalyze(resource._id)}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
                  title="Re-run AI analysis with updated criteria"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span>Re-analyze</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats for Decision Making */}
          {isReadyForDecision() && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(resource.aiConfidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">AI Confidence</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {resource.aiIssues?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Issues Found</div>
                </div>
                <div>
                  <div className="text-lg font-semibold capitalize text-gray-900">
                    {resource.aiVerdict || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">AI Verdict</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminResourceCard;