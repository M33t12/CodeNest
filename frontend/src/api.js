// src/api.js - Enhanced with AI features while keeping your existing structure
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔑 send/receive cookies automatically
  timeout: 30000, // Added: 30 second timeout for AI operations
});

// Request interceptor for debugging (optional - you can remove this)
api.interceptors.request.use(
  (config) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error:`, {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    return Promise.reject(error);
  }
);

// AI Analysis Helper Functions (NEW)
export const aiHelpers = {
  needsAnalysis: (resource) => {
    return !resource.aiAnalyzedAt || 
           resource.aiVerdict === 'unknown' || 
           resource.aiConfidence === 0;
  },
  
  readyForDecision: (resource) => {
    return resource.status === 'pending' && 
           resource.aiAnalyzedAt && 
           resource.aiVerdict !== 'unknown';
  },
  
  getConfidenceLevel: (confidence) => {
    if (confidence >= 0.8) return { level: 'high', color: 'green' };
    if (confidence >= 0.6) return { level: 'medium', color: 'yellow' };
    return { level: 'low', color: 'red' };
  }
};

// Enhanced API object with AI methods (NEW)
const enhancedApi = {
  // Keep all your existing usage: api.get, api.post, etc.
  ...api,
  
  // AI Analysis Methods (NEW)
  ai: {
    // Analyze single resource
    analyzeResource: (resourceId) => {
      return api.post(`/admin/resources/${resourceId}/analyze`, {}, {
        timeout: 60000 // 60 second timeout for AI analysis
      });
    },
    
    // Re-analyze resource
    reAnalyzeResource: (resourceId) => {
      return api.post(`/admin/resources/${resourceId}/reanalyze`, {}, {
        timeout: 60000
      });
    },
    
    // Get AI moderation statistics
    getModerationStats: (timeframe = '30') => {
      return api.get(`/admin/analytics/ai-moderation?timeframe=${timeframe}`);
    },
    
    // Batch analyze resources
    batchAnalyze: async (resourceIds) => {
      const results = [];
      const batchSize = 3; // Process 3 at a time to avoid overwhelming server
      
      for (let i = 0; i < resourceIds.length; i += batchSize) {
        const batch = resourceIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(id => 
          enhancedApi.ai.analyzeResource(id)
            .then(result => ({ id, success: true, result }))
            .catch(error => ({ id, success: false, error: error.message }))
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < resourceIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    }
  },

  // Enhanced Admin Methods (NEW - additions to existing admin calls)
  admin: {
    // Enhanced approve with AI options
    approveResource: (resourceId, options = {}) => {
      const requestBody = {
        adminNotes: options.adminNotes,
        overrideAI: options.overrideAI || false,
        forceApproval: options.forceApproval || false
      };
      return api.put(`/admin/resources/${resourceId}/approve`, requestBody);
    },
    
    // Enhanced reject with AI context
    rejectResource: (resourceId, reason, options = {}) => {
      const requestBody = {
        reason,
        adminNotes: options.adminNotes,
        deleteFiles: options.deleteFiles || false
      };
      return api.put(`/admin/resources/${resourceId}/reject`, requestBody);
    },
    
    // Get pending resources with AI filtering
    getPendingResources: (category = 'all', aiVerdict = null) => {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (aiVerdict) params.append('aiVerdict', aiVerdict);
      return api.get(`/admin/resources/pending?${params}`);
    },
    
    // Get resources with enhanced filtering
    getResources: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      return api.get(`/admin/resources?${params}`);
    }
  }
};

export default enhancedApi;