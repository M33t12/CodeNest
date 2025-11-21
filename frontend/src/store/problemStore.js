import { create } from 'zustand';
import problemService from '../services/problemService';

const useProblemStore = create((set, get) => ({
  // State
  problems: [],
  topics: [],
  statistics: null,
  loading: false,
  error: null,
  filters: {
    difficulty: '',
    topic: '',
    search: '',
    page: 1,
    limit: 50,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  },

  // Actions
  fetchProblems: async (customFilters = {}) => {
    set({ loading: true, error: null });
    try {
      const filters = { ...get().filters, ...customFilters };
      const response = await problemService.getProblems(filters);
      
      set({
        problems: response.data || [],
        pagination: response.pagination || {
          total: 0,
          page: 1,
          limit: 50,
          pages: 0
        },
        filters,
        loading: false,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch problems';
      console.error('Store error:', errorMessage);
      set({
        error: errorMessage,
        loading: false,
        problems: [], // Reset problems on error
      });
    }
  },

  fetchTopics: async () => {
    try {
      const response = await problemService.getTopics();
      set({ topics: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      set({ topics: [] });
    }
  },

  fetchStatistics: async () => {
    try {
      const response = await problemService.getStatistics();
      set({ statistics: response.data || null });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      set({ statistics: null });
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === 'page' ? value : 1, // Reset to page 1 when other filters change
      },
    }));
    // Auto-fetch when filter changes
    get().fetchProblems();
  },

  resetFilters: () => {
    set({
      filters: {
        difficulty: '',
        topic: '',
        search: '',
        page: 1,
        limit: 50,
      },
    });
    get().fetchProblems();
  },

  clearError: () => set({ error: null }),
}));

export default useProblemStore;