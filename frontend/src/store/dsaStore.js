// src/store/dsaStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { useUserStore } from './userStore';

const API_URL = "http://localhost:5000/api";

export const useDSAStore = create(
  devtools(
    (set, get) => ({
      // DSA state
      questions: [],
      userProgress: null,
      isLoading: false,
      error: null,
      filters: {
        topic: '',
        difficulty: ''
      },

      // Actions
      setQuestions: (questions) => set({ questions }),
      setUserProgress: (userProgress) => set({ userProgress }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

      // Fetch DSA questions
      fetchQuestions: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams({
            ...get().filters,
            ...filters
          });
          
          const response = await axios.get(`${API_URL}/dsa/questions?${queryParams}`);
          const questions = response.data;
          set({ questions, isLoading: false });
          return questions;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch user progress
      fetchUserProgress: async () => {
        const token = useUserStore.getState().token;
        if (!token) {
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/dsa/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const progress = response.data;
          set({ userProgress: progress, isLoading: false });
          return progress;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Update question status
      updateQuestionStatus: async (questionId, status) => {
        const token = useUserStore.getState().token;
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        try {
          const response = await axios.put(`${API_URL}/dsa/questions/${questionId}/status`, { status }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          const updatedProgress = response.data;
          set({ userProgress: updatedProgress });
          return updatedProgress;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      }
    }),
    { name: 'dsa-store' }
  )
);