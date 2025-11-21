// Activities Section Component

import { Users, BookOpen, CheckCircle, XCircle, UserX , Activity } from "lucide-react";

export const ActivitiesSection = ({ activities, isLoading }) => {

  console.log("Activities :: Activities section :: ", activities);
  
  const activityList = activities?.activities || []; // extract the array safely

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return <Users className="w-4 h-4 text-blue-500" />;
      case 'resource_uploaded': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'resource_approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'resource_rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'user_blocked': return <UserX className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.action) {
      case 'registered':
        return `${activity.user.firstName} ${activity.user.lastName} joined the platform`;
      case 'resource_uploaded':
        return `${activity.user?.uploaderName} uploaded "${activity.user?.resourceName}"`;
      case 'approved':
        return `Resource "${activity.resource.name}" was approved`;
      case 'resource_rejected':
        return `Resource "${activity.resource.name}" was rejected`;
      case 'user_blocked':
        return `User ${activity.user.firstName + activity.user.lastName} was blocked`;
      default:
        return activity.user.message || 'Unknown activity';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
        <span className="text-sm text-gray-600">{activities?.total || 0} activities</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="divide-y divide-gray-200">
          {activityList.map((activity) => (
            <div key={activity._id} className="p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {activity?.details?.category || activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <div className="text-lg">No recent activities</div>
            <p className="text-gray-400 mt-2">Activities will appear here as they happen</p>
          </div>
        )}
      </div>
    </div>
  );
};
