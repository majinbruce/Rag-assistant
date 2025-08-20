import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads and indexing
  withCredentials: true, // Include cookies for refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token using the auth API
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = refreshResponse.data;
        
        // Update stored token
        localStorage.setItem('accessToken', accessToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('ragUser');
        
        // Emit custom event for auth failure (to be handled by App component)
        window.dispatchEvent(new CustomEvent('auth-failed'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Document API
export const documentAPI = {
  // Get all documents
  getDocuments: async () => {
    const response = await api.get('/documents');
    return { data: response.data };
  },

  // Add a text document
  addDocument: async (document) => {
    const response = await api.post('/documents', {
      content: document.content,
      title: document.title || 'Untitled Document'
    });
    return { data: response.data };
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return { data: response.data };
  },

  // Index a document
  indexDocument: async (documentId) => {
    const response = await api.post(`/documents/${documentId}/index`);
    return { data: response.data };
  },

  // Get indexed documents
  getIndexedDocuments: async () => {
    const response = await api.get('/documents/indexed');
    return { data: response.data };
  },

  // Clear index
  clearIndex: async () => {
    const response = await api.delete('/documents/indexed');
    return { data: response.data };
  },

  // Deindex a single document
  deindexDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}/index`);
    return { data: response.data };
  },
};

// Chat API
export const chatAPI = {
  // Send a message and get RAG response
  sendMessage: async (message, sessionId = 'default') => {
    const response = await api.post('/chat', {
      message,
      sessionId
    });
    return { data: response.data };
  },

  // Get chat history
  getChatHistory: async (sessionId = 'default') => {
    const response = await api.get(`/chat/${sessionId}`);
    return { data: response.data };
  },

  // Save chat history (handled automatically by server)
  saveChatHistory: async (chatHistory) => {
    // No-op since server handles this automatically
    return { data: { success: true } };
  },

  // Clear chat history
  clearChatHistory: async (sessionId = 'default') => {
    const response = await api.delete(`/chat/${sessionId}`);
    return { data: response.data };
  },
};

// File processing API
export const fileAPI = {
  // Upload and process file
  processFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return { data: response.data };
  },

  // Process URL content
  processUrl: async (url) => {
    const response = await api.post('/documents/url', { url });
    return { data: response.data };
  },
};

export default api;