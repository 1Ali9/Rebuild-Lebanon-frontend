import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3500/api";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 10000,
  withCredentials: true
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
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

// Enhanced response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Standardize successful responses
    const standardizedResponse = {
      ...response,
      data: {
        success: true,
        ...response.data,
        // Ensure user object maintains all fields
        ...(response.data.user && {
          user: {
            ...response.data.user,
            // Explicitly preserve location fields
            governorate: response.data.user.governorate,
            district: response.data.user.district,
            // Include all other fields
            ...response.data.user
          }
        })
      }
    };
    return standardizedResponse;
  },
  (error) => {
    // Handle token expiration
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Standardize error responses
    const formattedError = {
      message: error.response?.data?.message || 
               error.message || 
               "Request failed",
      code: error.response?.status || 
            error.code || 
            "UNKNOWN_ERROR",
      data: error.response?.data,
      originalError: error
    };

    return Promise.reject(formattedError);
  }
);

// Enhanced endpoint creator
const createEndpoint = (method, endpoint, defaultError) => {
  return async (data = null, params = null) => {
    try {
      const config = {
        method,
        url: endpoint
      };

      // Handle GET vs other methods
      if (method.toLowerCase() === 'get') {
        config.params = params || data;
      } else {
        config.data = data;
      }

      const response = await axiosInstance(config);
      
      // Ensure complete user data is returned
      if (response.data?.user) {
        return {
          ...response.data,
          user: {
            ...response.data.user,
            // Double-check preservation of critical fields
            governorate: response.data.user.governorate,
            district: response.data.user.district,
            role: response.data.user.role,
            ...response.data.user
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`API ${method.toUpperCase()} ${endpoint} failed:`, error);
      throw {
        ...error,
        message: error.message || defaultError,
        endpoint,
        method
      };
    }
  };
};

// API Endpoints
export const authAPI = {
  login: createEndpoint('post', '/auth/login', 'Login failed'),
  register: createEndpoint('post', '/auth/register', 'Registration failed'),
  logout: createEndpoint('post', '/auth/logout', 'Logout failed'),
  verifyToken: createEndpoint('get', '/auth/verify', 'Token verification failed'),
  refreshToken: createEndpoint('post', '/auth/refresh', 'Token refresh failed')
};

export const usersAPI = {
  getProfile: createEndpoint('get', '/users/profile', 'Failed to fetch profile'),
  getSpecialists: createEndpoint('get', '/users/specialists', 'Failed to fetch specialists'),
  getClients: createEndpoint('get', '/users/clients', 'Failed to fetch clients'),
  updateProfile: createEndpoint('put', '/users/profile', 'Failed to update profile'),
  updateNeededSpecialists: createEndpoint('put', '/users/needed-specialists', 'Failed to update specialists'),
  updateAvailability: createEndpoint('put', '/users/availability', 'Failed to update availability')
};

export const messagesAPI = {
  getConversations: createEndpoint('get', '/messages/conversations', 'Failed to fetch conversations'),
  getMessages: createEndpoint('get', '/messages/conversation/:id', 'Failed to fetch messages'),
  sendMessage: createEndpoint('post', '/messages', 'Failed to send message'),
  createConversation: createEndpoint('post', '/messages/conversations', 'Failed to create conversation'),
  markAsRead: createEndpoint('patch', '/messages/:id/read', 'Failed to mark as read')
};

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

// Debug utility (remove in production)
export const debugAPI = {
  printUserData: () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Current token:", token);
      axiosInstance.get('/auth/verify')
        .then(res => console.log("Current user data:", res.data?.user))
        .catch(err => console.error("Debug error:", err));
    } else {
      console.log("No token found");
    }
  }
};

export { axiosInstance };
export default {
  axiosInstance,
  authAPI,
  usersAPI,
  messagesAPI,
  managedAPI,
  debugAPI
};