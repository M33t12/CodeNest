// // store/adminStore.js
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import api from '../api';
// import { useUserStore } from './userStore';

// export const useAdminStore = create(
//   devtools(
//     (set, get) => ({
//       // Dashboard data
//       dashboardData: {},
      
//       // Users management
//       users: [],
//       selectedUser: null,
//       totalUsers: 0,
//       userPage: 1,
//       userSearchTerm: '',
//       userFilter: 'all',
      
//       // Resources management
//       adminResources: [],
//       pendingResources: [],
      
//       // Analytics data
//       analytics: {},
      
//       // Activities feed
//       activities: [],
      
//       // UI states
//       isLoading: false,
//       error: null,
      
//       // Actions
//       setDashboardData: (data) => set({ dashboardData: data }),
//       setUsers: (users, total = null) => set({ 
//         users, 
//         ...(total !== null && { totalUsers: total })
//       }),
//       setSelectedUser: (user) => set({ selectedUser: user }),
//       setUserPage: (page) => set({ userPage: page }),
//       setUserSearchTerm: (term) => set({ userSearchTerm: term }),
//       setUserFilter: (filter) => set({ userFilter: filter }),
//       setAdminResources: (resources) => set({ adminResources: resources }),
//       setPendingResources: (resources) => set({ pendingResources: resources }),
//       setAnalytics: (data) => set({ analytics: data }),
//       setActivities: (activities) => set({ activities }),
//       setLoading: (isLoading) => set({ isLoading }),
//       setError: (error) => set({ error }),
      
//       // API Functions
//       fetchDashboardData: async () => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.get('/admin/dashboard');
//           set({ dashboardData: response.data, isLoading: false });
//           return response.data;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       fetchUsers: async (page = 1, search = '', status = 'all', limit = 10) => {
//         set({ isLoading: true, error: null });
//         try {
//           const params = new URLSearchParams({
//             page: page.toString(),
//             limit: limit.toString(),
//             ...(search && { search }),
//             ...(status !== 'all' && { status })
//           });
          
//           const response = await api.get(`/admin/users?${params}`);
//           const data = response.data;

//           set({ 
//             users: data.users, 
//             totalUsers: data.pagination.totalUsers,
//             userPage: data.pagination.currentPage,
//             userSearchTerm: search,
//             userFilter: status,
//             isLoading: false 
//           });
//           return data;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       fetchUserDetails: async (userId) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.get(`/admin/users/${userId}`);
//           const userData = response.data;
//           set({ selectedUser: userData, isLoading: false });
//           return userData;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       blockUser: async (userId, reason) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/users/${userId}/block`, { reason });
//           const result = response.data;
          
//           const users = get().users.map(user => 
//             user._id === userId ? { ...user, status: 'blocked', blockReason: reason } : user
//           );
//           set({ users, isLoading: false });
          
//           const selectedUser = get().selectedUser;
//           if (selectedUser && selectedUser._id === userId) {
//             set({ selectedUser: { ...selectedUser, status: 'blocked', blockReason: reason } });
//           }
          
//           return result;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       unblockUser: async (userId) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/users/${userId}/unblock`);
//           const result = response.data;
          
//           const users = get().users.map(user => 
//             user._id === userId ? { ...user, status: 'active' } : user
//           );
//           set({ users, isLoading: false });
          
//           const selectedUser = get().selectedUser;
//           if (selectedUser && selectedUser._id === userId) {
//             set({ selectedUser: { ...selectedUser, status: 'active' } });
//           }
          
//           return result;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       promoteUser: async (userId) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/users/${userId}/promote`);
//           const result = response.data;
          
//           const users = get().users.map(user => 
//             user._id === userId ? { ...user, role: 'admin' } : user
//           );
//           set({ users, isLoading: false });
          
//           const selectedUser = get().selectedUser;
//           if (selectedUser && selectedUser._id === userId) {
//             set({ selectedUser: { ...selectedUser, role: 'admin' } });
//           }
          
//           return result;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       demoteUser: async (userId) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/users/${userId}/demote`);
//           const result = response.data;
          
//           const users = get().users.map(user => 
//             user._id === userId ? { ...user, role: 'user' } : user
//           );
//           set({ users, isLoading: false });
          
//           const selectedUser = get().selectedUser;
//           if (selectedUser && selectedUser._id === userId) {
//             set({ selectedUser: { ...selectedUser, role: 'user' } });
//           }
          
//           return result;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },
      
//       // NEW: Delete user
//       deleteUser: async (userId) => {
//         set({ isLoading: true, error: null });
//         try {
//           await api.delete(`/admin/users/${userId}`);
          
//           // Remove user from the users list and reset selected user if it was the same one
//           const users = get().users.filter(user => user._id !== userId);
//           set({ users, selectedUser: null, totalUsers: get().totalUsers - 1, isLoading: false });

//           return { message: 'User deleted successfully' };
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       // Resources Management
//       fetchAdminResources: async (filters = {}) => {
//         set({ isLoading: true, error: null });
//         try {
//           const params = new URLSearchParams(filters);
//           const response = await api.get(`/admin/resources?${params}`);
//           const resources = response.data.resources;
//           set({ adminResources: resources, isLoading: false });
//           return resources;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       fetchPendingResources: async () => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.get('/admin/resources/pending');
//           const resources = response.data;
//           set({ pendingResources: resources, isLoading: false });
//           return resources;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       approveResource: async (resourceId) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/resources/${resourceId}/approve`);
//           const result = response.data;
//           console.log("AdminStore :: approveResource ::Result ::",result);
//           const pendingResources = get().pendingResources.filter(r => r._id !== resourceId);
//           set({ pendingResources, isLoading: false });
          
//           return result;
//         } catch (error) {
//           console.log("AdminStore :: approveResource :: ERROR:: ",error);
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       rejectResource: async (resourceId, reason) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.put(`/admin/resources/${resourceId}/reject`, { reason });
//           const result = response.data;
          
//           const pendingResources = get().pendingResources.filter(r => r._id !== resourceId);
//           set({ pendingResources, isLoading: false });
          
//           return result;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       // Analytics
//       fetchAnalytics: async () => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.get('/admin/analytics');
//           const analytics = response.data;
//           set({ analytics, isLoading: false });
//           return analytics;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       // Activities
//       fetchActivities: async (limit = 50) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await api.get(`/admin/activities?limit=${limit}`);
//           const activities = response.data;
//           set({ activities, isLoading: false });
//           return activities;
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       // Utility functions
//       clearError: () => set({ error: null }),
      
//       reset: () => set({
//         dashboardData: {},
//         users: [],
//         selectedUser: null,
//         totalUsers: 0,
//         userPage: 1,
//         userSearchTerm: '',
//         userFilter: 'all',
//         adminResources: [],
//         pendingResources: [],
//         analytics: {},
//         activities: [],
//         isLoading: false,
//         error: null
//       }),

//       // Refresh all data
//       refreshAllData: async () => {
//         try {
//           await Promise.all([
//             get().fetchDashboardData(),
//             get().fetchPendingResources(),
//             get().fetchActivities(20)
//           ]);
//         } catch (error) {
//           console.error('Error refreshing admin data:', error);
//           throw error;
//         }
//       }
//     }),
//     { name: 'admin-store' }
//   )
// );

// store/adminStore.js - Enhanced with AI Analysis Features
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../api';
import { useUserStore } from './userStore';

export const useAdminStore = create(
  devtools(
    (set, get) => ({
      // Dashboard data
      dashboardData: {},
      
      // Users management
      users: [],
      selectedUser: null,
      totalUsers: 0,
      userPage: 1,
      userSearchTerm: '',
      userFilter: 'all',
      
      // Resources management
      adminResources: [],
      pendingResources: [],
      
      // AI Analysis specific
      aiAnalysisQueue: [],
      aiAnalysisResults: {},
      aiModerationStats: {},
      
      // Analytics data
      analytics: {},
      
      // Activities feed
      activities: [],
      
      // UI states
      isLoading: false,
      isAnalyzing: false,
      error: null,
      
      // Actions
      setDashboardData: (data) => set({ dashboardData: data }),
      setUsers: (users, total = null) => set({ 
        users, 
        ...(total !== null && { totalUsers: total })
      }),
      setSelectedUser: (user) => set({ selectedUser: user }),
      setUserPage: (page) => set({ userPage: page }),
      setUserSearchTerm: (term) => set({ userSearchTerm: term }),
      setUserFilter: (filter) => set({ userFilter: filter }),
      setAdminResources: (resources) => set({ adminResources: resources }),
      setPendingResources: (resources) => set({ pendingResources: resources }),
      setAnalytics: (data) => set({ analytics: data }),
      setActivities: (activities) => set({ activities }),
      setLoading: (isLoading) => set({ isLoading }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setError: (error) => set({ error }),
      
      // API Functions
      fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/admin/dashboard');
          set({ dashboardData: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUsers: async (page = 1, search = '', status = 'all', limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status !== 'all' && { status })
          });
          
          const response = await api.get(`/admin/users?${params}`);
          const data = response.data;

          set({ 
            users: data.users, 
            totalUsers: data.pagination.totalUsers,
            userPage: data.pagination.currentPage,
            userSearchTerm: search,
            userFilter: status,
            isLoading: false 
          });
          return data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUserDetails: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/admin/users/${userId}`);
          const userData = response.data;
          set({ selectedUser: userData, isLoading: false });
          return userData;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      blockUser: async (userId, reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/admin/users/${userId}/block`, { reason });
          const result = response.data;
          
          const users = get().users.map(user => 
            user._id === userId ? { ...user, status: 'blocked', blockReason: reason } : user
          );
          set({ users, isLoading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser._id === userId) {
            set({ selectedUser: { ...selectedUser, status: 'blocked', blockReason: reason } });
          }
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      unblockUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/admin/users/${userId}/unblock`);
          const result = response.data;
          
          const users = get().users.map(user => 
            user._id === userId ? { ...user, status: 'active' } : user
          );
          set({ users, isLoading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser._id === userId) {
            set({ selectedUser: { ...selectedUser, status: 'active' } });
          }
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      promoteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/admin/users/${userId}/promote`);
          const result = response.data;
          
          const users = get().users.map(user => 
            user._id === userId ? { ...user, role: 'admin' } : user
          );
          set({ users, isLoading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser._id === userId) {
            set({ selectedUser: { ...selectedUser, role: 'admin' } });
          }
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      demoteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/admin/users/${userId}/demote`);
          const result = response.data;
          
          const users = get().users.map(user => 
            user._id === userId ? { ...user, role: 'user' } : user
          );
          set({ users, isLoading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser._id === userId) {
            set({ selectedUser: { ...selectedUser, role: 'user' } });
          }
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/admin/users/${userId}`);
          
          const users = get().users.filter(user => user._id !== userId);
          set({ users, selectedUser: null, totalUsers: get().totalUsers - 1, isLoading: false });

          return { message: 'User deleted successfully' };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Enhanced Resources Management with AI Features
      fetchAdminResources: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value);
            }
          });
          
          const response = await api.get(`/admin/resources?${params}`);
          const resources = response.data.resources;
          set({ adminResources: resources, isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchPendingResources: async (category = 'all', aiVerdict = null) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (category !== 'all') params.append('category', category);
          if (aiVerdict) params.append('aiVerdict', aiVerdict);
          
          const response = await api.get(`/admin/resources/pending?${params}`);
          const resources = response.data;
          set({ pendingResources: resources, isLoading: false });
          return resources;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // NEW: Trigger AI Analysis for a resource
      analyzeResource: async (resourceId) => {
        set({ isAnalyzing: true, error: null });
        try {
          const response = await api.post(`/admin/resources/${resourceId}/analyze`);
          const result = response.data;
          
          // Update the resource in both admin and pending resources
          const updateResourceWithAI = (resources) => 
            resources.map(r => r._id === resourceId ? { ...r, ...result.resource } : r);
          
          set(state => ({
            adminResources: updateResourceWithAI(state.adminResources),
            pendingResources: {
              ...state.pendingResources,
              resources: updateResourceWithAI(state.pendingResources.resources || [])
            },
            isAnalyzing: false
          }));
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isAnalyzing: false });
          throw error;
        }
      },

      // NEW: Re-analyze resource with updated AI
      reAnalyzeResource: async (resourceId) => {
        set({ isAnalyzing: true, error: null });
        try {
          const response = await api.post(`/admin/resources/${resourceId}/reanalyze`);
          const result = response.data;
          
          // Update the resource with new AI analysis
          const updateResourceWithAI = (resources) => 
            resources.map(r => r._id === resourceId ? { ...r, ...result.resource } : r);
          
          set(state => ({
            adminResources: updateResourceWithAI(state.adminResources),
            pendingResources: {
              ...state.pendingResources,
              resources: updateResourceWithAI(state.pendingResources.resources || [])
            },
            isAnalyzing: false
          }));
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isAnalyzing: false });
          throw error;
        }
      },


      // Enhanced approve with AI validation
      approveResource: async (resourceId, options = {}) => {
        set({ isLoading: true, error: null });
        try {
          const requestBody = {
            ...options,
            adminNotes: options.adminNotes || "Approved by admin",
            overrideAI: options.overrideAI || false,
            forceApproval: options.forceApproval || false
          };

          const response = await api.put(`/admin/resources/${resourceId}/approve`, requestBody);
          const result = response.data;
          
          // Remove from pending resources and update admin resources
          const removeFromPending = (resources) => resources.filter(r => r._id !== resourceId);
          const updateAdminResource = (resources) => {
            const existingIndex = resources.findIndex(r => r._id === resourceId);
            if (existingIndex >= 0) {
              const updated = [...resources];
              updated[existingIndex] = result.resource;
              return updated;
            }
            return [...resources, result.resource];
          };
          
          set(state => ({
            pendingResources: {
              ...state.pendingResources,
              resources: removeFromPending(state.pendingResources.resources || [])
            },
            adminResources: updateAdminResource(state.adminResources),
            isLoading: false
          }));
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Enhanced reject with detailed feedback
      rejectResource: async (resourceId, reason, options = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/admin/resources/${resourceId}/reject`, { 
            reason, 
            ...options 
          });
          const result = response.data;
          
          // Remove from pending resources and update admin resources
          const removeFromPending = (resources) => resources.filter(r => r._id !== resourceId);
          const addToAdmin = (resources) => [...resources, result.resource];
          
          set(state => ({
            pendingResources: {
              ...state.pendingResources,
              resources: removeFromPending(state.pendingResources.resources || [])
            },
            adminResources: state.adminResources.some(r => r._id === resourceId) 
              ? state.adminResources.map(r => r._id === resourceId ? result.resource : r)
              : addToAdmin(state.adminResources),
            isLoading: false
          }));
          
          return result;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Delete single resource with proper error handling
      deleteResource: async (resourceId, deleteOptions = {}) => {
        set({ isLoading: true, error: null });
        try {
          const requestBody = {
            confirmDeletion: true,
            deleteFiles: deleteOptions.deleteFiles !== false,
            reason: deleteOptions.reason || "Deleted by admin",
            notifyUser: deleteOptions.notifyUser || false
          };

          const response = await api.delete(`/admin/resources/${resourceId}`, {
            data: requestBody
          });
          
          // Remove from both resource arrays
          set(state => ({
            adminResources: state.adminResources.filter(r => r._id !== resourceId),
            pendingResources: {
              ...state.pendingResources,
              resources: (state.pendingResources.resources || []).filter(r => r._id !== resourceId)
            },
            isLoading: false
          }));
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Bulk delete resources
      bulkDeleteResources: async (resourceIds, deleteOptions = {}) => {
        set({ isLoading: true, error: null });
        try {
          const requestBody = {
            resourceIds,
            confirmDeletion: true,
            deleteFiles: deleteOptions.deleteFiles !== false,
            reason: deleteOptions.reason || "Bulk deleted by admin",
            notifyUsers: deleteOptions.notifyUsers || false
          };

          const response = await api.post('/admin/resources/bulk-delete', requestBody);
          
          // Remove all deleted resources from state
          set(state => ({
            adminResources: state.adminResources.filter(r => !resourceIds.includes(r._id)),
            pendingResources: {
              ...state.pendingResources,
              resources: (state.pendingResources.resources || []).filter(r => !resourceIds.includes(r._id))
            },
            isLoading: false
          }));
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // / Check Groq API status
      checkGroqStatus: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/admin/groq/status');
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Fetch AI moderation analytics with timeframe
      // Fetch AI moderation analytics with timeframe
      fetchAIModerationAnalytics: async (timeframe = '30') => {
        // 1. Clear previous stats immediately to prevent stale data display
        set({ isLoading: true, error: null, aiModerationStats: {} }); 
        
        try {
          const effectiveTimeframe = timeframe?.toString() || '30'; // Ensure timeframe is a string or defaults
          const response = await api.get(`/admin/analytics/ai-moderation?timeframe=${effectiveTimeframe}`);
          const stats = response.data;
          
          // 2. Set the new stats on success
          set({ 
            aiModerationStats: stats, 
            isLoading: false,
            error: null // Clear any previous error
          });
          return stats;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch AI moderation analytics.';
          
          // 3. Reset to a clean, empty state on error
          set({ 
            error: errorMessage, 
            isLoading: false, 
            aiModerationStats: {} 
          }); 
          
          // Log the error for better debugging (optional, depending on where error handling lives)
          console.error("AI Moderation Analytics Fetch Error:", error);

          // Re-throw the error so components can handle it (e.g., displaying a toast)
          throw new Error(errorMessage);
        }
      },

      // NEW: Batch analyze multiple resources
      batchAnalyzeResources: async (resourceIds) => {
        set({ isAnalyzing: true, error: null });
        try {
          const results = [];
          for (const resourceId of resourceIds) {
            try {
              const result = await get().analyzeResource(resourceId);
              results.push({ resourceId, success: true, result });
            } catch (error) {
              results.push({ resourceId, success: false, error: error.message });
            }
            // Add small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          set({ isAnalyzing: false });
          return results;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isAnalyzing: false });
          throw error;
        }
      },

      // Fetch analytics with enhanced data
      fetchAnalytics: async (timeframe = '30') => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/admin/analytics?timeframe=${timeframe}`);
          const analytics = response.data;
          set({ analytics, isLoading: false });
          return analytics;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Activities
      fetchActivities: async (limit = 50) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/admin/activities?limit=${limit}`);
          const activities = response.data;
          set({ activities, isLoading: false });
          return activities;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Utility functions
      clearError: () => set({ error: null }),
      
      // NEW: Get resources needing AI analysis
      getResourcesNeedingAnalysis: () => {
        const { pendingResources } = get();
        if (!pendingResources.resources) return [];
        
        return pendingResources.resources.filter(resource => 
          !resource.aiAnalyzedAt || 
          resource.aiVerdict === 'unknown' || 
          resource.aiConfidence === 0
        );
      },

      // NEW: Get resources ready for decision
      getResourcesReadyForDecision: () => {
        const { pendingResources } = get();
        if (!pendingResources.resources) return [];
        
        return pendingResources.resources.filter(resource => 
          resource.aiAnalyzedAt && 
          resource.aiVerdict !== 'unknown' && 
          resource.aiConfidence > 0
        );
      },

      reset: () => set({
        dashboardData: {},
        users: [],
        selectedUser: null,
        totalUsers: 0,
        userPage: 1,
        userSearchTerm: '',
        userFilter: 'all',
        adminResources: [],
        pendingResources: [],
        aiAnalysisQueue: [],
        aiAnalysisResults: {},
        aiModerationStats: {},
        analytics: {},
        activities: [],
        isLoading: false,
        isAnalyzing: false,
        error: null
      }),

      // Refresh all data
      refreshAllData: async () => {
        try {
          await Promise.all([
            get().fetchDashboardData(),
            get().fetchPendingResources(),
            get().fetchAIModerationAnalytics(),
            get().fetchActivities(20)
          ]);
        } catch (error) {
          console.error('Error refreshing admin data:', error);
          throw error;
        }
      }
    }),
    { name: 'admin-store' }
  )
);