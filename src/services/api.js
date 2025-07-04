import axios from "axios";

// Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3500/api";

// Create main axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true // Enable cookies if needed
});

/**
 * Request Interceptor
 * - Adds auth token to requests
 * - Handles request errors
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Only attempt to add token if we're not calling auth endpoints
    if (!config.url?.includes('/auth')) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles common error responses
 * - Manages token expiration
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response - just pass through
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Format consistent error response
    const formattedError = {
      message: error.response?.data?.message || error.message || "Request failed",
      code: error.response?.status || error.code || "UNKNOWN_ERROR",
      data: error.response?.data,
      originalError: error
    };

    console.error("API Error:", formattedError);
    return Promise.reject(formattedError);
  }
);

// Helper function to create API endpoints
const createEndpoint = (method, endpoint, defaultError) => {
  return async (data = null, params = null) => {
    try {
      const response = await axiosInstance({
        method,
        url: endpoint,
        data,
        params
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.message || defaultError;
      console.error(`API ${method.toUpperCase()} ${endpoint} failed:`, error);
      throw { 
        ...error,
        message: errorMessage,
        endpoint,
        method
      };
    }
  };
};

// Auth API Endpoints
export const authAPI = {
  login: createEndpoint('post', '/auth/login', 'Login failed'),
  register: createEndpoint('post', '/auth/register', 'Registration failed'),
  logout: createEndpoint('post', '/auth/logout', 'Logout failed'),
  verifyToken: createEndpoint('get', '/auth/verify', 'Token verification failed'),
  refreshToken: createEndpoint('post', '/auth/refresh', 'Token refresh failed')
};

// Users API Endpoints
export const usersAPI = {
  getProfile: createEndpoint('get', '/users/profile', 'Failed to fetch profile'),
  getSpecialists: createEndpoint('get', '/users/specialists', 'Failed to fetch specialists'),
  getClients: createEndpoint('get', '/users/clients', 'Failed to fetch clients'),
  updateProfile: createEndpoint('put', '/users/profile', 'Failed to update profile'),
  updateNeededSpecialists: createEndpoint('put', '/users/needed-specialists', 'Failed to update specialists'),
  updateAvailability: createEndpoint('put', '/users/availability', 'Failed to update availability')
};

// Messages API Endpoints
export const messagesAPI = {
  getConversations: createEndpoint('get', '/messages/conversations', 'Failed to fetch conversations'),
  getMessages: createEndpoint('get', '/messages/conversation/:id', 'Failed to fetch messages'),
  sendMessage: createEndpoint('post', '/messages', 'Failed to send message'),
  createConversation: createEndpoint('post', '/messages/conversations', 'Failed to create conversation'),
  markAsRead: createEndpoint('patch', '/messages/:id/read', 'Failed to mark as read')
};

// Managed API Endpoints
export const managedAPI = {
  addClient: createEndpoint('post', '/managed/clients', 'Failed to add client'),
  removeClient: createEndpoint('delete', '/managed/clients/:id', 'Failed to remove client'),
  updateClientStatus: createEndpoint('patch', '/managed/clients/:id/status', 'Failed to update client status'),
  getManagedClients: createEndpoint('get', '/managed/clients', 'Failed to fetch clients'),
  addSpecialist: createEndpoint('post', '/managed/specialists', 'Failed to add specialist'),
  removeSpecialist: createEndpoint('delete', '/managed/specialists/:id', 'Failed to remove specialist'),
  updateSpecialistStatus: createEndpoint('patch', '/managed/specialists/:id/status', 'Failed to update specialist status'),
  getManagedSpecialists: createEndpoint('get', '/managed/specialists', 'Failed to fetch specialists'),
  getStatistics: createEndpoint('get', '/managed/statistics', 'Failed to fetch statistics')
};

// Export the axios instance directly
export { axiosInstance };

// Default export for backward compatibility
export default {
  axiosInstance,
  authAPI,
  usersAPI,
  messagesAPI,
  managedAPI
};