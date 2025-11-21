import api from '../api';

// Problem Service - API calls for problems
const problemService = {
  // Get all problems with filters
  getProblems: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const response = await api.get(`/dsa-problem?${params.toString()}`);
      
      // Backend returns { success, data, pagination }
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          total: 0,
          page: 1,
          limit: 50,
          pages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching problems:', error);
      throw error;
    }
  },

  // Get problem by slug
  getProblemBySlug: async (slug) => {
    try {
      const response = await api.get(`/dsa-problem/${slug}`);
      return response.data; // { success, data }
    } catch (error) {
      console.error('Error fetching problem:', error);
      throw error;
    }
  },

  // Get all topics
  getTopics: async () => {
    try {
      const response = await api.get('/dsa-problem/topics');
      return {
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/dsa-problem/statistics');
      return {
        data: response.data.data || {
          total: 0,
          byDifficulty: {
            easy: 0,
            medium: 0,
            hard: 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Sync problems from LeetCode (admin only)
  syncProblems: async () => {
    try {
      const response = await api.post('/dsa-problem/sync');
      return response.data;
    } catch (error) {
      console.error('Error syncing problems:', error);
      throw error;
    }
  },
};

export default problemService;