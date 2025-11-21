// User Detail View Component
import React from "react";
import { ArrowLeft, UserX, ExternalLink, Crown, UserCheck, Trash2 } from "lucide-react";
import { StatusBadge, RoleBadge, ResourceStatusBadge } from "../Badge";

export const UserDetailView = React.memo(({ 
  user, 
  onBack, 
  onBlockUser, 
  onUnblockUser, 
  onPromoteUser,
  onDemoteUser,
  onDeleteUser,
  isLoading
}) => {
  console.log("User in the userDetailView Component", user);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Users</span>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {user.status === 'active' && (
            <button
              onClick={() => onBlockUser(user)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              <UserX size={16} />
              <span>Block User</span>
            </button>
          )}
          
          {user.status === 'blocked' && (
            <button
              onClick={() => onUnblockUser(user._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={isLoading}
            >
              <UserCheck size={16} />
              <span>Unblock User</span>
            </button>
          )}
          
          {user.role !== 'admin' ? (
            <button
              onClick={() => onPromoteUser(user._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={isLoading}
            >
              <Crown size={16} />
              <span>Promote to Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onDemoteUser(user._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              disabled={isLoading}
            >
              <span>Demote from Admin</span>
            </button>
          )}
          
          {user.role !== 'admin' && (
            <button
              onClick={() => onDeleteUser(user)}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-red-600 transition-colors"
              disabled={isLoading}
            >
              <Trash2 size={16} />
              <span>Delete User</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Profile Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="text-gray-900">{user.firstName} {user.lastName}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{user.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={user.status} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <RoleBadge role={user.role} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <div className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <div className="text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
              
              {user.status === 'blocked' && user.blockedBy && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blocked By</label>
                    <div className="text-gray-900">
                      {user.blockedBy?.firstName} {user.blockedBy?.lastName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block Reason</label>
                    <div className="text-gray-900 bg-red-50 p-2 rounded text-sm">
                      {user.blockReason || 'No reason provided'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {user.profile?.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <div className="text-gray-900 bg-gray-50 p-3 rounded">{user.profile.bio}</div>
            </div>
          )}

          {user.profile?.linkedin || user.profile?.github ? (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Social Links</label>
              <div className="grid md:grid-cols-2 gap-4">
                {user.profile?.linkedin && (
                  <div>
                    <span className="text-sm text-gray-600">LinkedIn:</span>
                    <a 
                      href={user.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                
                {user.profile?.github && (
                  <div>
                    <span className="text-sm text-gray-600">GitHub:</span>
                    <a 
                      href={user.profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Activity Statistics */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Activity Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Resources Uploaded</span>
                <span className="font-semibold text-gray-900">{user.resourcesUploaded?.length || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">DSA Problems Solved</span>
                <span className="font-semibold text-red-600">{user.dsaProgress?.totalSolved || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes Taken</span>
                <span className="font-semibold text-green-600">{user.quizHistory?.length || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Interviews Completed</span>
                <span className="font-semibold text-blue-600">{user.interviewHistory?.length || 0}</span>
              </div>
            </div>
          </div>

          {user.dsaProgress && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">DSA Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Easy</span>
                  <span className="font-medium text-green-600">{user.dsaProgress.easySolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Medium</span>
                  <span className="font-medium text-yellow-600">{user.dsaProgress.mediumSolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Hard</span>
                  <span className="font-medium text-red-600">{user.dsaProgress.hardSolved}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {user.resourcesUploaded && user.resourcesUploaded.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Uploaded Resources</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.resourcesUploaded.slice(0, 6).map((resource) => (
              <div key={resource._id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{resource.name}</h4>
                <div className="text-sm text-gray-600 mb-2">{resource.subject}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">{resource.type.toUpperCase()}</span>
                  <ResourceStatusBadge status={resource.status} />
                </div>
              </div>
            ))}
          </div>
          {user.resourcesUploaded.length > 6 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                And {user.resourcesUploaded.length - 6} more resources...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});