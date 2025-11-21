import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Award,
  Eye,
  Star
} from 'lucide-react';

export const AnalyticsSection = () => {
  const [timeframe, setTimeframe] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setData({
        userGrowth: [
          { _id: { day: 1, month: 10, year: 2025 }, count: 12 },
          { _id: { day: 2, month: 10, year: 2025 }, count: 15 },
          { _id: { day: 3, month: 10, year: 2025 }, count: 8 },
          { _id: { day: 4, month: 10, year: 2025 }, count: 20 },
          { _id: { day: 5, month: 10, year: 2025 }, count: 18 },
        ],
        resourceTrends: [
          { _id: { type: 'pdf' }, count: 45 },
          { _id: { type: 'link' }, count: 32 },
          { _id: { type: 'blog' }, count: 28 },
          { _id: { type: 'image' }, count: 15 },
        ],
        subjectDistribution: [
          { _id: 'Data Structures', count: 42, avgRating: 4.5 },
          { _id: 'Algorithms', count: 38, avgRating: 4.7 },
          { _id: 'Web Development', count: 35, avgRating: 4.3 },
          { _id: 'Machine Learning', count: 28, avgRating: 4.6 },
          { _id: 'Database Systems', count: 25, avgRating: 4.4 },
        ],
        summary: {
          totalUsers: 1247,
          activeUsers: 892,
          totalResources: 156,
          approvedResources: 128,
          avgResourceRating: 4.5,
          totalViews: 8934,
          totalDownloads: 3421
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    const report = JSON.stringify(data, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const maxUserGrowth = Math.max(...data.userGrowth.map(d => d.count));
  const maxResourceTrend = Math.max(...data.resourceTrends.map(d => d.count));
  const maxSubjectCount = Math.max(...data.subjectDistribution.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into user and resource metrics</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Users
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.summary.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="mt-2 text-xs text-green-600">
            {data.summary.activeUsers} active users
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Resources
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.summary.totalResources}
          </div>
          <div className="text-sm text-gray-600">Total Resources</div>
          <div className="mt-2 text-xs text-green-600">
            {data.summary.approvedResources} approved
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Views
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.summary.totalViews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
          <div className="mt-2 text-xs text-purple-600">
            {Math.round(data.summary.totalViews / data.summary.totalResources)} avg per resource
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              Rating
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.summary.avgResourceRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
          <div className="mt-2 text-xs text-yellow-600">
            {data.summary.totalDownloads.toLocaleString()} downloads
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              <span>User Growth (Last {timeframe} Days)</span>
            </h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            {data.userGrowth.slice(-7).map((day, index) => {
              const date = new Date(day._id.year, day._id.month - 1, day._id.day);
              const percentage = (day.count / maxUserGrowth) * 100;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 min-w-24">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-8 text-right">
                    {day.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Types Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <span>Resources by Type</span>
            </h3>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            {data.resourceTrends.map((type, index) => {
              const percentage = (type.count / maxResourceTrend) * 100;
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize min-w-20">
                    {type._id.type}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-8 text-right">
                    {type.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Subject Performance</span>
          </h3>
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Resources</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Avg Rating</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {data.subjectDistribution.map((subject, index) => {
                const popularityPercentage = (subject.count / maxSubjectCount) * 100;
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {subject._id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {subject.count}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {subject.avgRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 max-w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${popularityPercentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(popularityPercentage)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Growth Trend</span>
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            User registrations are up by <strong className="text-blue-600">23%</strong> compared to last period.
          </p>
          <p className="text-xs text-gray-600">
            Highest growth on weekdays, particularly Mondays and Wednesdays.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Engagement</span>
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            Average session duration: <strong className="text-green-600">12 minutes</strong>
          </p>
          <p className="text-xs text-gray-600">
            Most active hours: 2-4 PM and 8-10 PM
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Top Content</span>
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong className="text-purple-600">Data Structures</strong> has the highest engagement
          </p>
          <p className="text-xs text-gray-600">
            PDFs are the most popular resource type
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;

// Additional helper component for exporting data
export const DataExportButton = ({ data, filename }) => {
  const handleExport = () => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion - customize based on your needs
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </button>
  );
};