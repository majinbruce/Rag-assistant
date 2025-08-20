import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://rag-assistant-production-467e.up.railway.app';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

// Debug logging (remove in production)
console.log('DEBUG - API_BASE_URL:', API_BASE_URL);
console.log('DEBUG - API_URL:', API_URL);
console.log('DEBUG - Auth baseURL:', `${API_URL}/auth`);

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  withCredentials: true, // Include cookies for refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
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

// Response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await authApi.post('/refresh-token');
        const { accessToken } = response.data;
        
        // Update stored token
        localStorage.setItem('accessToken', accessToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return authApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('ragUser');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async register(userData) {
    try {
      const response = await authApi.post('/register', userData);
      const { user, accessToken } = response.data;
      
      // Store access token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('ragUser', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      const code = error.response?.data?.code || 'REGISTRATION_FAILED';
      const details = error.response?.data?.details || {};
      
      throw {
        message,
        code,
        details,
        status: error.response?.status
      };
    }
  },

  async login(credentials) {
    try {
      const response = await authApi.post('/login', credentials);
      const { user, accessToken } = response.data;
      
      // Store access token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('ragUser', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      const code = error.response?.data?.code || 'LOGIN_FAILED';
      
      throw {
        message,
        code,
        status: error.response?.status
      };
    }
  },

  async logout() {
    try {
      await authApi.post('/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('ragUser');
    }
  },

  async getCurrentUser() {
    try {
      const response = await authApi.get('/me');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get current user';
      const code = error.response?.data?.code || 'USER_FETCH_FAILED';
      
      throw {
        message,
        code,
        status: error.response?.status
      };
    }
  },

  async refreshToken() {
    try {
      const response = await authApi.post('/refresh-token');
      const { user, accessToken } = response.data;
      
      // Update stored token and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('ragUser', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      const message = error.response?.data?.error || 'Token refresh failed';
      const code = error.response?.data?.code || 'TOKEN_REFRESH_FAILED';
      
      throw {
        message,
        code,
        status: error.response?.status
      };
    }
  },

  async updatePassword(passwords) {
    try {
      const response = await authApi.put('/password', passwords);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Password update failed';
      const code = error.response?.data?.code || 'PASSWORD_UPDATE_FAILED';
      
      throw {
        message,
        code,
        status: error.response?.status
      };
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('ragUser');
    return !!(token && user);
  },

  // Helper method to get stored user data
  getStoredUser() {
    try {
      const user = localStorage.getItem('ragUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }
};

export default authService;