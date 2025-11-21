// Users Section Component
import React, { useState, useCallback, useMemo } from "react";
import { UserDetailView } from "./UserDetailView";
import { Search, Users } from "lucide-react";
import { UserTableRow } from "./UserTableRow";
import { Pagination } from "../Pagination";

export const UsersSection = React.memo(({ 
  users, 
  totalUsers, 
  currentPage, 
  searchTerm, 
  userFilter,
  isLoading,
  onPageChange, 
  onSearchChange, 
  onFilterChange,
  onBlockUser,
  onUnblockUser,
  onPromoteUser,
  onDemoteUser,
  onDeleteUser,
  onFetchUserDetails
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  const usersPerPage = 10;
  const totalPages = useMemo(() => Math.ceil(totalUsers / usersPerPage), [totalUsers]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleUserSelect = useCallback(async (userId) => {
    try {
      const userDetails = await onFetchUserDetails(userId);
      setSelectedUser(userDetails);
    } catch (err) {
      console.error("Failed to fetch user details", err);
    }
  }, [onFetchUserDetails]);

  const handleBack = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Memoized action handlers that also update local selectedUser state
  const handleBlockUser = useCallback(async (user) => {
    await onBlockUser(user);
    // If this user is currently selected, we need to refetch their details
    if (selectedUser && selectedUser._id === user._id) {
      try {
        const updatedUser = await onFetchUserDetails(user._id);
        setSelectedUser(updatedUser);
      } catch (err) {
        console.error("Failed to refresh user details", err);
      }
    }
  }, [onBlockUser, selectedUser, onFetchUserDetails]);

  const handleUnblockUser = useCallback(async (userId) => {
    await onUnblockUser(userId);
    // If this user is currently selected, update local state
    if (selectedUser && selectedUser._id === userId) {
      const { blockReason, blockedBy, blockedAt, ...updatedUser } = selectedUser;
      setSelectedUser({
        ...updatedUser,
        status: "active"
      });
    }
  }, [onUnblockUser, selectedUser]);

  const handlePromoteUser = useCallback(async (userId) => {
    await onPromoteUser(userId);
    // If this user is currently selected, update local state
    if (selectedUser && selectedUser._id === userId) {
      setSelectedUser({
        ...selectedUser,
        role: "admin"
      });
    }
  }, [onPromoteUser, selectedUser]);

  const handleDemoteUser = useCallback(async (userId) => {
    await onDemoteUser(userId);
    // If this user is currently selected, update local state
    if (selectedUser && selectedUser._id === userId) {
      setSelectedUser({
        ...selectedUser,
        role: "user"
      });
    }
  }, [onDemoteUser, selectedUser]);

  const handleDeleteUser = useCallback(async (user) => {
    await onDeleteUser(user);
    // If this user is currently selected, clear selection
    if (selectedUser && selectedUser._id === user._id) {
      setSelectedUser(null);
    }
  }, [onDeleteUser, selectedUser]);

  if (selectedUser) {
    return (
      <UserDetailView 
        user={selectedUser} 
        onBack={handleBack}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        onPromoteUser={handlePromoteUser}
        onDemoteUser={handleDemoteUser}
        onDeleteUser={handleDeleteUser}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">Total: {totalUsers} users</p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={userFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-2xs px-2 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resources
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserTableRow
                      key={user._id}
                      user={user}
                      onSelectUser={() => handleUserSelect(user._id)}
                      onBlockUser={handleBlockUser}
                      onUnblockUser={handleUnblockUser}
                      onPromoteUser={handlePromoteUser}
                      onDemoteUser={handleDemoteUser}
                      onDeleteUser={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalUsers}
                itemsPerPage={usersPerPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <div className="text-lg">No users found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
});