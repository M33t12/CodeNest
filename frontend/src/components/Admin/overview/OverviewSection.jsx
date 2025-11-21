
// Overview Section Component
export const OverviewSection = ({ data }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Registered</span>
              <span className="font-semibold text-gray-900">{(data.users?.total || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-green-600">{(data.users?.active || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blocked Users</span>
              <span className="font-semibold text-red-600">{(data.users?.blocked || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Users</span>
              <span className="font-semibold text-purple-600">{(data.users?.admins || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Content Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Resources</span>
              <span className="font-semibold text-gray-900">{(data.resources?.total || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{(data.resources?.approved || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Review</span>
              <span className="font-semibold text-orange-600">{(data.resources?.pending || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rejected</span>
              <span className="font-semibold text-purple-600">{(data.resources?.rejected || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Active Users */}
      {data.mostActiveUsers && data.mostActiveUsers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Most Active Users</h3>
          <div className="space-y-3">
            {data.mostActiveUsers.slice(0, 5).map((user, index) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {/* Handling this will soon */}
                  {user.activityScore} activities 
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
