import { create } from 'zustand';
import progressService from '../services/progressService';

const useProgressStore = create((set, get) => ({
  // State
  progressMap: {}, // Map of problemId -> progress data
  statistics: null,
  loading: false,
  error: null,

  // Actions
  fetchUserProgress: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await progressService.getUserProgress(userId);
      
      // Convert array to map for quick lookup
      const progressMap = {};
      const progressArray = response.data || [];
      
      progressArray.forEach((progress) => {
        if (progress.problemId) {
          // Handle both populated and non-populated problemId
          const problemIdKey = typeof progress.problemId === 'object' 
            ? progress.problemId._id 
            : progress.problemId;
          progressMap[problemIdKey] = progress;
        }
      });

      set({
        progressMap,
        statistics: response.stats || null,
        loading: false,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch progress';
      console.error('Store error:', errorMessage);
      set({
        error: errorMessage,
        loading: false,
        progressMap: {}, // Reset on error
      });
    }
  },

  fetchProgressStats: async (userId) => {
    try {
      const response = await progressService.getProgressStats(userId);
      set({ statistics: response.data || null });
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
      set({ statistics: null });
    }
  },

  updateProgress: async (userId, problemId, data) => {
    try {
      const response = await progressService.updateProgress(userId, problemId, data);
      
      // Update local state
      set((state) => ({
        progressMap: {
          ...state.progressMap,
          [problemId]: response.data,
        },
      }));

      return response.data;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },

  markAsSolved: async (userId, problemId, additionalData = {}) => {
    return get().updateProgress(userId, problemId, {
      status: 'solved',
      ...additionalData,
    });
  },

  markAsAttempted: async (userId, problemId, additionalData = {}) => {
    return get().updateProgress(userId, problemId, {
      status: 'attempted',
      ...additionalData,
    });
  },

  updateNotes: async (userId, problemId, notes) => {
    return get().updateProgress(userId, problemId, { notes });
  },

  // Get progress for a specific problem
  getProgressForProblem: (problemId) => {
    return get().progressMap[problemId] || null;
  },

  // Check if problem is solved
  isProblemSolved: (problemId) => {
    const progress = get().progressMap[problemId];
    return progress?.status === 'solved';
  },

  // Check if problem is attempted
  isProblemAttempted: (problemId) => {
    const progress = get().progressMap[problemId];
    return progress?.status === 'attempted';
  },

  clearError: () => set({ error: null }),
}));

export default useProgressStore;