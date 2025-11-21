// // src/store/resourceStore.js
// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import axios from "axios"

// const API_URL = "http://localhost:5000/api"

// export const useResourceStore = create(
//   devtools(
//     (set, get) => ({
//       resources: [],
//       featuredResources: [],
//       pendingResources: [],
//       userResources: [],
//       selectedResource: null,
//       isLoading: false,
//       error: null,
//       pagination: null,
//       filters: {
//         subject: "",
//         type: "",
//         sort: "createdAt",
//         order: "desc",
//         page: 1,
//         limit: 12,
//       },

//       setResources: (resources) => set({ resources }),
//       setFeaturedResources: (featuredResources) => set({ featuredResources }),
//       setPendingResources: (pendingResources) => set({ pendingResources }),
//       setUserResources: (userResources) => set({ userResources }),
//       setSelectedResource: (selectedResource) => set({ selectedResource }),
//       setLoading: (isLoading) => set({ isLoading }),
//       setError: (error) => set({ error }),
//       setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
//       setPagination: (pagination) => set({ pagination }),

//       getResourceById: async (resourceId) => {
//         set({ isLoading: true, error: null })
//         try {
//           const response = await axios.get(`${API_URL}/resources/${resourceId}`, {
//             withCredentials: true,
//           })

//           const resource = response.data
//           set({ selectedResource: resource, isLoading: false })
//           return resource
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage, isLoading: false })
//           throw new Error(errorMessage)
//         }
//       },

//       fetchResources: async (filters = {}, options = {}) => {
//         set({ isLoading: true, error: null })
//         try {
//           const currentFilters = { ...get().filters, ...filters }
//           const queryParams = new URLSearchParams()

//           Object.entries(currentFilters).forEach(([key, value]) => {
//             if (value !== "" && value !== undefined && value !== null) {
//               queryParams.append(key, value)
//             }
//           })

//           const response = await axios.get(`${API_URL}/resources?${queryParams}`, {
//             withCredentials: true,
//           })

//           const { resources, pagination } = response.data

//           if (options.append && filters.page > 1) {
//             // Append to existing resources for "load more" functionality
//             set((state) => ({
//               resources: [...state.resources, ...resources],
//               pagination,
//               isLoading: false,
//             }))
//           } else {
//             // Replace resources for new search/filter
//             set({
//               resources,
//               pagination,
//               isLoading: false,
//               filters: currentFilters,
//             })
//           }

//           return response.data
//         } catch (error) {
//           set({ error: error.response?.data?.message || error.message, isLoading: false })
//           throw error
//         }
//       },

//       fetchFeaturedResources: async () => {
//         try {
//           const response = await axios.get(`${API_URL}/resources/featured`, {
//             withCredentials: true,
//           })
//           set({ featuredResources: response.data })
//           return response.data
//         } catch (error) {
//           console.error("Failed to fetch featured resources:", error)
//           set({ featuredResources: [] })
//         }
//       },

//       uploadResource: async (resourceData) => {
//         set({ isLoading: true, error: null })
//         try {
//           const response = await axios.post(`${API_URL}/resources`, resourceData, {
//             withCredentials: true,
//           })
//           set({ isLoading: false })

//           // Show AI analysis result if available
//           if (response.data.aiAnalysis) {
//             console.log("AI Analysis:", response.data.aiAnalysis)
//           }

//           return response.data
//         } catch (error) {
//           console.log("ERROR :: UPLOAD RESOURCE ::",error);
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage, isLoading: false })
//           throw new Error(errorMessage)
//         }
//       },

//       rateResource: async (resourceId, rating, review = "") => {
//         try {
//           const response = await axios.post(
//             `${API_URL}/resources/${resourceId}/rate`,
//             { rating, review },
//             { withCredentials: true },
//           )

//           // Update the resource in all relevant arrays
//           const updateResource = (resources) =>
//             resources.map((r) => (r._id === resourceId ? { ...r, ...response.data } : r))

//           set((state) => ({
//             resources: updateResource(state.resources),
//             featuredResources: updateResource(state.featuredResources),
//             userResources: updateResource(state.userResources),
//           }))

//           return response.data
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage })
//           throw new Error(errorMessage)
//         }
//       },

//       downloadResource: async (resourceId) => {
//         try {
//           const response = await axios.post(
//             `${API_URL}/resources/${resourceId}/download`,
//             {},
//             { withCredentials: true },
//           )

//           // Update download count in state
//           const updateDownloads = (resources) =>
//             resources.map((r) => (r._id === resourceId ? { ...r, downloads: response.data.downloads } : r))

//           set((state) => ({
//             resources: updateDownloads(state.resources),
//             featuredResources: updateDownloads(state.featuredResources),
//             userResources: updateDownloads(state.userResources),
//           }))

//           return response.data
//         } catch (error) {
//           console.error("Download tracking failed:", error)
//           // Don't throw error for download tracking failure
//         }
//       },

//       // Ftch user's own resources
//       fetchUserResources: async (status = "", page = 1) => {
//         set({ isLoading: true, error: null })
//         try {
//           const queryParams = new URLSearchParams({ page })
//           if (status) queryParams.append("status", status)

//           const response = await axios.get(`${API_URL}/resources/me/list?${queryParams}`, { withCredentials: true })

//           set({
//             userResources: response.data.resources,
//             pagination: response.data.pagination,
//             isLoading: false,
//           })
//           return response.data
//         } catch (error) {
//           set({ error: error.response?.data?.message || error.message, isLoading: false })
//           throw error
//         }
//       },
      
//       fetchPendingResources: async (page = 1) => {
//         set({ isLoading: true, error: null })
//         try {
//           const response = await axios.get(`${API_URL}/admin/resources/pending?page=${page}`, { withCredentials: true })
//           set({
//             pendingResources: response.data.resources,
//             pagination: response.data.pagination,
//             isLoading: false,
//           })
//           return response.data
//         } catch (error) {
//           set({ error: error.response?.data?.message || error.message, isLoading: false })
//           throw error
//         }
//       },

//       approveResource: async (resourceId, options = {}) => {
//         try {
//           const response = await axios.put(`${API_URL}/admin/resources/${resourceId}/approve`, options, {
//             withCredentials: true,
//           })

//           // Remove from pending resources
//           set((state) => ({
//             pendingResources: state.pendingResources.filter((r) => r._id !== resourceId),
//           }))

//           return response.data
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage })
//           throw new Error(errorMessage)
//         }
//       },

//       rejectResource: async (resourceId, reason) => {
//         try {
//           const response = await axios.put(
//             `${API_URL}/admin/resources/${resourceId}/reject`,
//             { reason },
//             { withCredentials: true },
//           )

//           // Remove from pending resources
//           set((state) => ({
//             pendingResources: state.pendingResources.filter((r) => r._id !== resourceId),
//           }))

//           return response.data
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage })
//           throw new Error(errorMessage)
//         }
//       },

//       updateResource: async (resourceId, updateData) => {
//         set({ isLoading: true, error: null })
//         try {
//           const response = await axios.put(`${API_URL}/resources/${resourceId}`, updateData, { withCredentials: true })

//           // Update in user resources
//           set((state) => ({
//             userResources: state.userResources.map((r) => (r._id === resourceId ? response.data.resource : r)),
//             isLoading: false,
//           }))

//           return response.data
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage, isLoading: false })
//           throw new Error(errorMessage)
//         }
//       },

//       deleteResource: async (resourceId) => {
//         try {
//           await axios.delete(`${API_URL}/resources/${resourceId}`, {
//             withCredentials: true,
//           })

//           // Remove from user resources
//           set((state) => ({
//             userResources: state.userResources.filter((r) => r._id !== resourceId),
//           }))

//           return true
//         } catch (error) {
//           const errorMessage = error.response?.data?.message || error.message
//           set({ error: errorMessage })
//           throw new Error(errorMessage)
//         }
//       },
//     }),
//     { name: "resource-store" },
//   ),
// )
// src/store/resourceStore.js
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import axios from "axios"

const API_URL = "http://localhost:5000/api"

export const useResourceStore = create(
  devtools(
    (set, get) => ({
      resources: [],
      featuredResources: [],
      pendingResources: [],
      userResources: [],
      selectedResource: null,
      isLoading: false,
      error: null,
      pagination: null,
      filters: {
        subject: "",
        type: "",
        sort: "createdAt",
        order: "desc",
        page: 1,
        limit: 12,
      },

      setResources: (resources) => set({ resources }),
      setFeaturedResources: (featuredResources) => set({ featuredResources }),
      setPendingResources: (pendingResources) => set({ pendingResources }),
      setUserResources: (userResources) => set({ userResources }),
      setSelectedResource: (selectedResource) => set({ selectedResource }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      setPagination: (pagination) => set({ pagination }),

      getResourceById: async (resourceId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.get(`${API_URL}/resources/${resourceId}`, {
            withCredentials: true,
          })

          const resource = response.data
          set({ selectedResource: resource, isLoading: false })
          return resource
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      fetchResources: async (filters = {}, options = {}) => {
        set({ isLoading: true, error: null })
        try {
          const currentFilters = { ...get().filters, ...filters }
          const queryParams = new URLSearchParams()

          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
              queryParams.append(key, value)
            }
          })

          const response = await axios.get(`${API_URL}/resources?${queryParams}`, {
            withCredentials: true,
          })

          const { resources, pagination } = response.data

          if (options.append && filters.page > 1) {
            // Append to existing resources for "load more" functionality
            set((state) => ({
              resources: [...state.resources, ...resources],
              pagination,
              isLoading: false,
            }))
          } else {
            // Replace resources for new search/filter
            set({
              resources,
              pagination,
              isLoading: false,
              filters: currentFilters,
            })
          }

          return response.data
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error
        }
      },

      fetchFeaturedResources: async () => {
        try {
          const response = await axios.get(`${API_URL}/resources/featured/list`, {
            withCredentials: true,
          })
          set({ featuredResources: response.data })
          return response.data
        } catch (error) {
          console.error("Failed to fetch featured resources:", error)
          set({ featuredResources: [] })
        }
      },

      uploadResource: async (resourceData) => {
        set({ isLoading: true, error: null })
        try {
          // Check if resourceData is FormData or regular object
          const isFormData = resourceData instanceof FormData
          
          const config = {
            withCredentials: true,
            headers: {
              'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            },
          }

          console.log("ResourceData in ResourceStore:: uploadResource :: ",resourceData);
          const response = await axios.post(`${API_URL}/resources`, resourceData, config)
          
          set({ isLoading: false })

          // Show AI analysis result if available
          if (response.data.aiProcessing) {
            console.log("AI Processing:", response.data.aiProcessing)
          }

          return response.data
        } catch (error) {
          console.log("ERROR :: UPLOAD RESOURCE ::", error)
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      rateResource: async (resourceId, rating, review = "") => {
        try {
          const response = await axios.post(
            `${API_URL}/resources/${resourceId}/rate`,
            { rating, review },
            { withCredentials: true },
          )

          // Update the resource in all relevant arrays
          const updateResource = (resources) =>
            resources.map((r) => (r._id === resourceId ? { ...r, ...response.data } : r))

          set((state) => ({
            resources: updateResource(state.resources),
            featuredResources: updateResource(state.featuredResources),
            userResources: updateResource(state.userResources),
          }))

          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      downloadResource: async (resourceId) => {
        try {
          const response = await axios.post(
            `${API_URL}/resources/${resourceId}/download`,
            {},
            { withCredentials: true },
          )

          // Update download count in state
          const updateDownloads = (resources) =>
            resources.map((r) => (r._id === resourceId ? { ...r, downloads: response.data.downloads } : r))

          set((state) => ({
            resources: updateDownloads(state.resources),
            featuredResources: updateDownloads(state.featuredResources),
            userResources: updateDownloads(state.userResources),
          }))

          return response.data
        } catch (error) {
          console.error("Download tracking failed:", error)
          // Don't throw error for download tracking failure
        }
      },

      // Fetch user's own resources
      fetchUserResources: async (status = "", page = 1) => {
        set({ isLoading: true, error: null })
        try {
          const queryParams = new URLSearchParams({ page })
          if (status) queryParams.append("status", status)

          const response = await axios.get(`${API_URL}/resources/me/list?${queryParams}`, { withCredentials: true })

          set({
            userResources: response.data.resources,
            pagination: response.data.pagination,
            isLoading: false,
          })
          return response.data
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error
        }
      },
      
      fetchPendingResources: async (page = 1) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.get(`${API_URL}/admin/resources/pending?page=${page}`, { withCredentials: true })
          set({
            pendingResources: response.data.resources,
            pagination: response.data.pagination,
            isLoading: false,
          })
          return response.data
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error
        }
      },

      approveResource: async (resourceId, options = {}) => {
        try {
          const response = await axios.put(`${API_URL}/admin/resources/${resourceId}/approve`, options, {
            withCredentials: true,
          })

          // Remove from pending resources
          set((state) => ({
            pendingResources: state.pendingResources.filter((r) => r._id !== resourceId),
          }))

          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      rejectResource: async (resourceId, reason) => {
        try {
          const response = await axios.put(
            `${API_URL}/admin/resources/${resourceId}/reject`,
            { reason },
            { withCredentials: true },
          )

          // Remove from pending resources
          set((state) => ({
            pendingResources: state.pendingResources.filter((r) => r._id !== resourceId),
          }))

          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      updateResource: async (resourceId, updateData) => {
        set({ isLoading: true, error: null })
        try {
          // Check if updateData is FormData or regular object
          const isFormData = updateData instanceof FormData
          
          const config = {
            withCredentials: true,
            headers: {
              'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            },
          }

          const response = await axios.put(`${API_URL}/resources/${resourceId}`, updateData, config)

          // Update in user resources
          set((state) => ({
            userResources: state.userResources.map((r) => (r._id === resourceId ? response.data.resource : r)),
            isLoading: false,
          }))

          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      deleteResource: async (resourceId) => {
        try {
          await axios.delete(`${API_URL}/resources/${resourceId}`, {
            withCredentials: true,
          })

          // Remove from user resources
          set((state) => ({
            userResources: state.userResources.filter((r) => r._id !== resourceId),
          }))

          return true
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Get popular resources
      fetchPopularResources: async (timeframe = '30', limit = 10) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.get(`${API_URL}/resources/analytics/popular?timeframe=${timeframe}&limit=${limit}`, {
            withCredentials: true,
          })
          set({ isLoading: false })
          return response.data
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      clearSelectedResource: () => set({ selectedResource: null }),
    }),
    { name: "resource-store" },
  ),
)