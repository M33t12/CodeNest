// store/interviewStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const useInterviewStore = create((set, get) => ({
  // State
  currentInterview: null,
  interviewHistory: [],
  isLoading: false,
  error: null,
  isRecording: false,
  audioBlob: null,
  feedback: null,
  
  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  // Start Interview
  startInterview: async (interviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/start`,
        interviewData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        set({
          currentInterview: {
            sessionId: response.data.data.sessionId,
            interviewType: response.data.data.interviewType,
            topic: response.data.data.topic,
            status: response.data.data.status,
            conversation: [
              {
                speaker: 'ai',
                message: response.data.data.aiMessage,
                timestamp: new Date()
              }
            ],
            questionCount: 0
          },
          isLoading: false,
          feedback: null // Clear any previous feedback
        });
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to start interview',
        isLoading: false
      });
      throw error;
    }
  },

  // Send Message
  sendMessage: async (message) => {
    const { currentInterview } = get();
    if (!currentInterview) return;

    set({ isLoading: true, error: null });
    
    // Optimistically add user message
    set({
      currentInterview: {
        ...currentInterview,
        conversation: [
          ...currentInterview.conversation,
          {
            speaker: 'user',
            message,
            timestamp: new Date()
          }
        ]
      }
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/message`,
        {
          sessionId: currentInterview.sessionId,
          message
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        set({
          currentInterview: {
            ...currentInterview,
            conversation: [
              ...get().currentInterview.conversation,
              {
                speaker: 'ai',
                message: response.data.data.aiMessage,
                timestamp: new Date()
              }
            ],
            questionCount: response.data.data.questionCount,
            shouldContinue: response.data.data.shouldContinue
          },
          isLoading: false
        });
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to send message',
        isLoading: false
      });
      throw error;
    }
  },

  // Transcribe Audio
  transcribeAudio: async (audioBlob) => {
    const { currentInterview } = get();
    if (!currentInterview) return;

    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', currentInterview.sessionId);

      const response = await axios.post(
        `${API_BASE_URL}/interview/transcribe`,
        formData,
        {
          withCredentials : true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        set({
          currentInterview: {
            ...currentInterview,
            conversation: [
              ...currentInterview.conversation,
              {
                speaker: 'user',
                message: response.data.data.transcription,
                timestamp: new Date(),
                audioTranscription: true
              },
              {
                speaker: 'ai',
                message: response.data.data.aiMessage,
                timestamp: new Date()
              }
            ],
            shouldContinue: response.data.data.shouldContinue
          },
          isLoading: false,
          audioBlob: null
        });
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to transcribe audio',
        isLoading: false
      });
      throw error;
    }
  },

  // Complete Interview
  completeInterview: async (feedbackFormat = 'text') => {
    const { currentInterview } = get();
    if (!currentInterview) {
      set({ error: 'No active interview session' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/complete`,
        {
          sessionId: currentInterview.sessionId,
          feedbackFormat
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update feedback state and clear current interview
        set({
          feedback: response.data.data,
          currentInterview: null,
          isLoading: false,
          error: null
        });
        
        console.log('Interview completed successfully:', response.data.data);
        
        // Refresh interview history to show the completed interview
        const userId = response.data.data.sessionId; // You might want to store userId separately
        get().fetchInterviewHistory({});
        
        return response.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete interview';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('Error completing interview:', error);
      throw error;
    }
  },

  // Fetch Interview History
  fetchInterviewHistory: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { status, limit = 10, page = 1 } = filters;
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit);
      params.append('page', page);

      const response = await axios.get(
        `${API_BASE_URL}/interview/user/history?${params.toString()}`,
        {
          withCredentials : true,
        }
      );

      if (response.data.success) {
        set({
          interviewHistory: response.data.data.interviews,
          isLoading: false
        });
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch interview history',
        isLoading: false
      });
      throw error;
    }
  },

  // Get Session Details
  getSessionDetails: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_BASE_URL}/interview/session/${sessionId}`,
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        set({ isLoading: false });
        return response.data.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch session details',
        isLoading: false
      });
      throw error;
    }
  },

  // Cancel Interview
  cancelInterview: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/cancel/${sessionId}`,
        {},
        {
          withCredentials : true,
        }
      );

      if (response.data.success) {
        set({
          currentInterview: null,
          isLoading: false
        });
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to cancel interview',
        isLoading: false
      });
      throw error;
    }
  },

  // Clear Current Interview
  clearCurrentInterview: () => set({ 
    currentInterview: null, 
    error: null,
    audioBlob: null
  }),

  // Clear Feedback (keeps it available until explicitly cleared)
  clearFeedback: () => set({ feedback: null }),

  // Audio Recording
  setRecording: (isRecording) => set({ isRecording }),
  
  setAudioBlob: (audioBlob) => set({ audioBlob }),
}));