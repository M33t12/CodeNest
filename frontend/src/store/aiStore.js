import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { useUserStore } from "./userStore";

const API_URL = "http://localhost:5000/api";

export const useAIStore = create(
  devtools(
    (set, get) => ({
      // Quiz state
      currentQuiz: null,
      quizHistory: [],
      currentSubmission: null,
      hintRequests: [],
      isLoading: false,
      error: null,
      quizResults: null,
      quizReview: null,

      // Actions
      setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
      setQuizHistory: (history) => set({ quizHistory: history }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearCurrentQuiz: () =>
        set({ currentQuiz: null, quizResults: null, hintRequests: [],quizReview: null }),

      setQuizReview: (reviewData) => {
        set({
            quizReview: reviewData, // { quiz: {...}, submission: {...} }
            quizResults: null,     // Clear results to switch view
        });
      },
      
      // Generate new quiz
      generateQuiz: async (quizConfig) => {
        const isFormData = quizConfig instanceof FormData;

        const config = {
          withCredentials: true,
          headers: {
            "Content-Type": isFormData
              ? "multipart/form-data"
              : "application/json",
          },
        };

        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/quiz/generate`,
            {
              title: quizConfig.title || `${quizConfig.subject} Quiz`,
              subject: quizConfig.subject,
              topic: quizConfig.topic || "",
              totalQuestions: quizConfig.numberOfQuestions || 10,
              difficulty: quizConfig.difficulty.toUpperCase(),
              timeLimit: quizConfig.timeLimit || 10,
            },config
          );

          const quiz = response.data;
          set({
            currentQuiz: quiz,
            isLoading: false,
            quizResults: null,
            hintRequests: [],
          });
          return quiz;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      // Fetch existing quiz by ID
      fetchQuizById: async (quizId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/quiz/${quizId}`, {withCredentials: true});

          const quiz = response.data;
          set({
            currentQuiz: quiz,
            isLoading: false,
            quizResults: null,
            hintRequests: [],
          });
          return quiz;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      // Request hint for a question
      getQuestionHint: async (quizId, questionId) => {

        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/quiz/hint/${quizId}`,
            { questionId },
            {
              withCredentials:true
            }
          );

          const { hint } = response.data;

          // Add hint to local state
          set((state) => ({
            hintRequests: [...state.hintRequests, { questionId, hint }],
            isLoading: false,
          }));

          return hint;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      // Submit quiz
      submitQuiz: async (quizId, responses, timeTaken) => {

        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/quiz/submit`,
            {
              quizId,
              responses,
              timeTaken,
            },
            {
              
              withCredentials: true,
              headers: {"Content-Type": "application/json"},
              
            }
          );

          const result = response.data;
          set({
            quizResults: result,
            isLoading: false,
            currentQuiz: null,
          });

          // Refresh quiz history
          get().fetchQuizHistory();

          return result;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      // Fetch user quiz history
      fetchQuizHistory: async (filters = {}) => {
        const userId = useUserStore.getState().user?._id;

        if (!userId) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams(filters).toString();
          const response = await axios.get(
            `${API_URL}/quiz/history/${userId}${
              queryParams ? `?${queryParams}` : ""
            }`,
            {
              withCredentials:true
            }
          );

          const history = response.data;
          set({ quizHistory: history, isLoading: false });
          return history;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      // Re-attempt quiz
      reAttemptQuiz: async (quizId) => {

        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/quiz/re-attempt/${quizId}`,
            {},
            {
              withCredentials:true,
            }
          );

          const quiz = {
            _id: response.data.quizId,
            questions: response.data.questions,
            title: response.data.title, 
            subject: response.data.subject,
            timeLimit: response.data.timeLimit,
            totalQuestions: response.data.totalQuestions,
          };

          set({
            currentQuiz: quiz,
            isLoading: false,
            quizResults: null,
            quizReview: null,
            hintRequests: [],
          });
          return quiz;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },
    }),
    { name: "ai-store" }
  )
);
