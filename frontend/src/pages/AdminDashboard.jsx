import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  XCircle as CloseCircle,
  AirplayIcon
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { StatCard } from '../components/Admin/statistics/StatCard';
import { OverviewSection } from '../components/Admin/overview/OverviewSection';
import { UsersSection } from '../components/Admin/users/UsersSection';
import { ResourcesSection } from "../components/Admin/resources/ResourcesSection";
import { AnalyticsSection } from '../components/Admin/analytics/AnalyticsSection';
import { ActivitiesSection } from '../components/Admin/activities/ActivitiesSection';
import { BlockUserModal } from "../components/Admin/users/BlockUserModal";
import { DeleteUserModal } from "../components/Admin/users/DeleteUserModal";
import AIAnalysisDashboard from '../components/Admin/AiAnalysisDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockingUser, setBlockingUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Admin store
  const {
    // State
    dashboardData,
    users,
    selectedUser,
    totalUsers,
    userPage,
    userSearchTerm,
    userFilter,
    adminResources,
    pendingResources,
    analytics,
    activities,
    isLoading,
    error,
    
    // Actions
    setSelectedUser,
    setUserPage,
    setUserSearchTerm,
    setUserFilter,
    fetchDashboardData,
    fetchUsers,
    fetchUserDetails,
    fetchAdminResources,
    fetchPendingResources,
    fetchAnalytics,
    fetchActivities,
    blockUser,
    unblockUser,
    promoteUser,
    demoteUser,
    deleteUser,
    approveResource,
    rejectResource,
    clearError,
    refreshAllData
  } = useAdminStore();
  
  // Initialize Admin
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        await refreshAllData();
      } catch (error) {
        console.error('Failed to initialize admin:', error);
      }
    };
    initializeAdmin();
  }, [refreshAllData]);

  // Load tab specific Data
  useEffect(() => {
    const loadTabData = async () => {
      try {
        switch (activeTab) {
          case 'users':
            await fetchUsers(userPage, userSearchTerm, userFilter);
            break;
          case 'resources':
            await fetchAdminResources();
            break;
          case 'analytics':
            await fetchAnalytics();
            break;
          case 'activities':
            await fetchActivities();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to load tab data:', error);
      }
    };

    if (activeTab !== 'overview') {
      loadTabData();
    }
  }, [activeTab, userPage, userFilter, fetchUsers, fetchAdminResources, fetchAnalytics, fetchActivities]);

  // filter the user based on the search term, page no..
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (activeTab === 'users') {
        fetchUsers(1, userSearchTerm, userFilter);
        setUserPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [userSearchTerm, fetchDashboardData,userFilter, activeTab, fetchUsers, setUserPage]);

  const handleBlockUser = async () => {
    if (!blockingUser || !blockReason.trim()) return;
   
    try {
      await blockUser(blockingUser._id, blockReason);
      
      // Update selectedUser if it's the same user being blocked
      if (selectedUser && selectedUser._id === blockingUser._id) {
        setSelectedUser({
          ...selectedUser,
          status: "blocked",
          blockReason,
          blockedBy: {
            firstName: "Admin", // You might want to get actual admin info
            lastName: "User"
          }
        });
      }
      
      setShowBlockModal(false);
      setBlockingUser(null);
      setBlockReason('');
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser._id);
      
      // If the deleted user is currently selected, clear the selection
      if (selectedUser && selectedUser._id === deletingUser._id) {
        setSelectedUser(null);
      }
      
      setShowDeleteModal(false);
      setDeletingUser(null);
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      
      // Update selectedUser if it's the same user being unblocked
      if (selectedUser && selectedUser._id === userId) {
        const updatedUser = { ...selectedUser };
        updatedUser.status = "active";
        delete updatedUser.blockReason;
        delete updatedUser.blockedBy;
        setSelectedUser(updatedUser);
      }
      
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await promoteUser(userId);
      
      // Update selectedUser if it's the same user being promoted
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({
          ...selectedUser,
          role: "admin"
        });
      }
      
      console.log("Promote User ::", selectedUser);
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to promote user:', error);
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await demoteUser(userId);
      
      // Update selectedUser if it's the same user being demoted
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({
          ...selectedUser,
          role: "user"
        });
      }
      
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to demote user:', error);
    }
  };

  const handleApproveResource = async (resourceId) => {
    try {
      await approveResource(resourceId);
      await fetchDashboardData();
    } catch (error) {
      console.log("ERROR :: FRONTEND :: adminDashboard :: handleApproveResource ::",error);
      console.error('Failed to approve resource:', error);
    }
  };
  
  const handleRejectResource = async (resourceId, reason) => {
    try {
      await rejectResource(resourceId, reason);
      await fetchDashboardData();
    } catch (error) {
      console.log("ERROR :: FRONTEND :: adminDashboard :: handleRejectResource ::",error);
      console.error('Failed to reject resource:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'ai-dashboard' , label:'AI-dashboard' , icon :AirplayIcon}
  ];

  if (isLoading && Object.keys(dashboardData).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, content, and platform analytics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              clearError();
              refreshAllData();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Showing Errors: */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <CloseCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={dashboardData.users?.total || 0}
          icon={Users}
          color="blue"
          subtitle={`${dashboardData.users?.newThisMonth || 0} new this month`}
        />
        <StatCard
          title="Active Users"
          value={dashboardData.users?.active || 0}
          icon={UserCheck}
          color="green"
          subtitle={`${dashboardData.users?.blocked || 0} blocked`}
        />
        <StatCard
          title="Total Resources"
          value={dashboardData.resources?.total || 0}
          icon={BookOpen}
          color="purple"
          subtitle={`${dashboardData.resources?.pending || 0} pending`}
        />
        <StatCard
          title="Platform Activity"
          value={dashboardData.platform?.totalQuizzes || 0}
          icon={Activity}
          color="orange"
          subtitle="Quizzes taken"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewSection data={dashboardData} />
          )}

          {activeTab === 'users' && (
            <UsersSection 
              users={users}
              totalUsers={totalUsers}
              currentPage={userPage}
              searchTerm={userSearchTerm}
              userFilter={userFilter}
              selectedUser={selectedUser}
              isLoading={isLoading}
              onPageChange={setUserPage}
              onSearchChange={setUserSearchTerm}
              onFilterChange={setUserFilter}
              onSelectUser={setSelectedUser}
              onBlockUser={(user) => {
                setBlockingUser(user);
                setShowBlockModal(true);
              }}
              onUnblockUser={handleUnblockUser}
              onPromoteUser={handlePromoteUser}
              onDemoteUser={handleDemoteUser}
              onDeleteUser={(user) => {
                setDeletingUser(user);
                setShowDeleteModal(true);
              }}
              onFetchUserDetails={fetchUserDetails}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesSection 
              resources={adminResources} 
              pendingResources={pendingResources}
              onApprove={handleApproveResource}
              onReject={handleRejectResource}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsSection data={analytics} isLoading={isLoading} />
          )}

          {activeTab === 'activities' && (
            <ActivitiesSection activities={activities} isLoading={isLoading} />
          )}

          {
            activeTab === 'ai-dashboard' &&
            (
              <AIAnalysisDashboard/>
            )
          }
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && blockingUser && (
        <BlockUserModal
          user={blockingUser}
          reason={blockReason}
          onReasonChange={setBlockReason}
          onConfirm={handleBlockUser}
          onCancel={() => {
            setShowBlockModal(false);
            setBlockingUser(null);
            setBlockReason('');
          }}
          isLoading={isLoading}
        />
      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingUser(null);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AdminDashboard;