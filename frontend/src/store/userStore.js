// src/store/userStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from '../api';

const useUserStore = create(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(`/auth/login`, { email, password });
          set({ user: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (firstName, lastName, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(`/auth/register`, { firstName, lastName, email, password });
          set({ user: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await api.post("/auth/logout");
        set({ user: null });
      },

      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/users/profile`);
          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ user: null, error: "Session expired. Please log in again.", isLoading: false });
        }
      },

      updateUserProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put("/users/profile", updates);
          set({ user: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      isAdmin: () => get().user?.role === 'admin',

      // NEW: Helper method to get user ID
      getUserId: () => get().user?._id || get().user?.id || null,
      
      // NEW: Helper method to check if user is authenticated
      isAuthenticated: () => !!get().user,
    }),
    { name: "user-store" }
  )
);

export { useUserStore };
