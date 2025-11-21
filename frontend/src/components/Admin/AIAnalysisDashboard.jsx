import React, { useState, useEffect } from 'react';
import {
  Bot,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Loader2,
  Zap,
  Clock,
  Users,
  FileText,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Gauge,
  Calendar,
  LineChart as LineChartIcon
} from 'lucide-react';

const AIAnalysisDashboard = () => {
  const [timeframe, setTimeframe] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiModerationStats, setAiModerationStats] = useState(null);

  useEffect(() => {
    fetchAIModerationAnalytics();
  }, [timeframe]);

  const fetchAIModerationAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setAiModerationStats({
        summary: {
          totalPending: 45,
          totalAnalyzed: 128,
          awaitingAnalysis: 12,
          analysisCompletionRate: 73.5
        },
        verdictDistribution: {
          approve: 78,
          reject: 32,
          neutral: 18
        },
        adminActivity: [
          { adminId: '1', adminName: 'John Doe', analysisCount: 45 },
          { adminId: '2', adminName: 'Jane Smith', analysisCount: 38 },
          { adminId: '3', adminName: 'Bob Johnson', analysisCount: 29 },
          { adminId: '4', adminName: 'Alice Williams', analysisCount: 16 }
        ],
        commonIssues: [
          { issue: 'Low quality content', count: 15 },
          { issue: 'Misleading information', count: 12 },
          { issue: 'Inappropriate material', count: 8 },
          { issue: 'Copyright concerns', count: 7 },
          { issue: 'Spam content', count: 5 },
          { issue: 'Incomplete resources', count: 4 }
        ],
        aiAccuracy: {
          overallAccuracy: 87.3,
          falsePositives: 8,
          falseNegatives: 5,
          truePositives: 70,
          trueNegatives: 45
        },
        performanceMetrics: {
          avgAnalysisTime: 2.4,
          totalTokensUsed: 1456789,
          avgConfidence: 0.78,
          highConfidenceCount: 89
        },
        trends: [
          { date: '2025-09-28', analyzed: 12, approved: 8, rejected: 4 },
          { date: '2025-09-29', analyzed: 15, approved: 11, rejected: 4 },
          { date: '2025-09-30', analyzed: 18, approved: 13, rejected: 5 },
          { date: '2025-10-01', analyzed: 14, approved: 10, rejected: 4 },
          { date: '2025-10-02', analyzed: 16, approved: 12, rejected: 4 },
          { date: '2025-10-03', analyzed: 19, approved: 14, rejected: 5 },
          { date: '2025-10-04', analyzed: 20, approved: 15, rejected: 5 }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch AI analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    setIsExporting(true);
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        timeframe: `${timeframe} days`,
        ...aiModerationStats
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-moderation-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  if (!aiModerationStats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load AI analytics</span>
        </div>
      </div>
    );
  }

  const { summary, verdictDistribution, adminActivity, commonIssues, aiAccuracy, performanceMetrics, trends } = aiModerationStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <span>AI Moderation Dashboard</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor AI analysis performance and resource moderation insights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-800 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <button
            onClick={exportReport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 border text-gray-800 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export Report</span>
          </button>

          <button
            onClick={fetchAIModerationAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Alert */}
      {summary.awaitingAnalysis > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {summary.awaitingAnalysis} Resources Need Analysis
                </h3>
                <p className="text-gray-600">
                  Resources are waiting for AI analysis before admin review
                </p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
              <Zap className="w-5 h-5" />
              <span>Analyze All Resources</span>
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Completion
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {summary.analysisCompletionRate}%
          </div>
          <div className="text-sm text-gray-600">Analysis completion rate</div>
          <div className="mt-2 text-xs text-gray-500">
            {summary.totalAnalyzed} of {summary.totalPending} analyzed
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Accuracy
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {aiAccuracy.overallAccuracy}%
          </div>
          <div className="text-sm text-gray-600">AI prediction accuracy</div>
          <div className="mt-2 text-xs text-gray-500">
            Based on admin decisions
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Speed
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {performanceMetrics.avgAnalysisTime}s
          </div>
          <div className="text-sm text-gray-600">Avg analysis time</div>
          <div className="mt-2 text-xs text-gray-500">
            Per resource analysis
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              Queue
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {summary.awaitingAnalysis}
          </div>
          <div className="text-sm text-gray-600">Awaiting analysis</div>
          <div className="mt-2 text-xs text-gray-500">
            Resources in queue
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Verdict Distribution</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(verdictDistribution).map(([verdict, count]) => {
              const total = Object.values(verdictDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              
              const getVerdictColor = (v) => {
                switch (v) {
                  case 'approve': return 'bg-green-500';
                  case 'reject': return 'bg-red-500';
                  case 'neutral': return 'bg-yellow-500';
                  default: return 'bg-gray-500';
                }
              };

              return (
                <div key={verdict} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 min-w-24">
                    <div className={`w-3 h-3 rounded-full ${getVerdictColor(verdict)}`} />
                    <span className="text-sm text-gray-800 font-medium capitalize">{verdict}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">{count} resources</div>
                      <div className="text-sm font-medium text-gray-900">{percentage}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getVerdictColor(verdict)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Activity */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Admin Analysis Activity</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {adminActivity.slice(0, 5).map((admin, index) => (
              <div key={admin.adminId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {admin.adminName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{admin.adminName}</div>
                    <div className="text-sm text-gray-500">Admin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{admin.analysisCount}</div>
                  <div className="text-sm text-gray-500">analyses</div>
                </div>
              </div>
            ))}
            
            {adminActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No analysis activity in selected timeframe</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Trends */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <LineChartIcon className="w-5 h-5 text-blue-600" />
            <span>Analysis Trends (Last 7 Days)</span>
          </h3>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        
        <div className="space-y-3">
          {trends.map((day, index) => {
            const maxAnalyzed = Math.max(...trends.map(d => d.analyzed));
            const percentage = (day.analyzed / maxAnalyzed) * 100;
            const approvalRate = day.analyzed > 0 ? Math.round((day.approved / day.analyzed) * 100) : 0;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 min-w-24">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {day.analyzed} analyzed ({day.approved} approved, {day.rejected} rejected)
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {approvalRate}% approval
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Most Common Issues</h3>
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonIssues.slice(0, 6).map((issue, index) => (
            <div key={issue.issue} className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{issue.issue}</div>
                  <div className="text-sm text-gray-600">
                    Found in {issue.count} resource{issue.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {commonIssues.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No common issues detected in selected timeframe</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI Performance Metrics</h3>
          <Gauge className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aiAccuracy.truePositives}
            </div>
            <div className="text-sm text-gray-700 mb-1">True Positives</div>
            <div className="text-xs text-gray-600">Correctly identified issues</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {aiAccuracy.trueNegatives}
            </div>
            <div className="text-sm text-gray-700 mb-1">True Negatives</div>
            <div className="text-xs text-gray-600">Correctly approved clean content</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {aiAccuracy.falsePositives}
            </div>
            <div className="text-sm text-gray-700 mb-1">False Positives</div>
            <div className="text-xs text-gray-600">Incorrectly flagged</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {aiAccuracy.falseNegatives}
            </div>
            <div className="text-sm text-gray-700 mb-1">False Negatives</div>
            <div className="text-xs text-gray-600">Missed issues</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Avg Confidence</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {Math.round(performanceMetrics.avgConfidence * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Tokens Used</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {(performanceMetrics.totalTokensUsed / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">High Confidence</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {performanceMetrics.highConfidenceCount}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalAnalyzed}
            </div>
            <div className="text-sm text-gray-600">Total Analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {verdictDistribution.approve || 0}
            </div>
            <div className="text-sm text-gray-600">AI Approved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {verdictDistribution.reject || 0}
            </div>
            <div className="text-sm text-gray-600">AI Flagged</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {verdictDistribution.neutral || 0}
            </div>
            <div className="text-sm text-gray-600">Needs Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDashboard;