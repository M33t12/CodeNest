import api from '../api';

// Progress Service - API calls for user progress
const progressService = {
  // Get user progress for all problems
  getUserProgress: async (userId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/dsa-progress/${userId}?${params.toString()}`);
      
      // Backend returns { success, data, stats }
      return {
        data: response.data.data || [],
        stats: response.data.stats || {
          total: 0,
          solved: 0,
          attempted: 0,
          notStarted: 0
        }
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  },

  // Update progress for a specific problem
  updateProgress: async (userId, problemId, data) => {
    try {
      const response = await api.put(`/dsa-progress/${userId}/${problemId}`, data);
      
      // Backend returns { success, data }
      return {
        data: response.data.data
      };
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Get progress statistics
  getProgressStats: async (userId) => {
    try {
      const response = await api.get(`/dsa-progress/${userId}/stats`);
      
      // Backend returns { success, data }
      return {
        data: response.data.data || {
          byStatus: {
            solved: 0,
            attempted: 0,
            'not-started': 0
          },
          byDifficulty: {
            Easy: { solved: 0, attempted: 0, total: 0 },
            Medium: { solved: 0, attempted: 0, total: 0 },
            Hard: { solved: 0, attempted: 0, total: 0 }
          }
        }
      };
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      throw error;
    }
  },

  // Mark problem as solved
  markAsSolved: async (userId, problemId, data = {}) => {
    try {
      const response = await api.put(`/dsa-progress/${userId}/${problemId}`, {
        status: 'solved',
        ...data,
      });
      return {
        data: response.data.data
      };
    } catch (error) {
      console.error('Error marking as solved:', error);
      throw error;
    }
  },

  // Mark problem as attempted
  markAsAttempted: async (userId, problemId, data = {}) => {
    try {
      const response = await api.put(`/dsa-progress/${userId}/${problemId}`, {
        status: 'attempted',
        ...data,
      });
      return {
        data: response.data.data
      };
    } catch (error) {
      console.error('Error marking as attempted:', error);
      throw error;
    }
  },

  // Update notes for a problem
  updateNotes: async (userId, problemId, notes) => {
    try {
      const response = await api.put(`/dsa-progress/${userId}/${problemId}`, {
        notes,
      });
      return {
        data: response.data.data
      };
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  },
};

export default progressService;