import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },
};

// Users API
export const usersAPI = {
  getSpecialists: async (filters) => {
    try {
      const response = await api.get('/users/specialists', { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch specialists' };
    }
  },

  getClients: async (filters) => {
    try {
      const response = await api.get('/users/clients', { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch clients' };
    }
  },

  updateNeededSpecialists: async (specialists) => {
    try {
      const response = await api.put('/users/needed-specialists', { specialists });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update needed specialists' };
    }
  },

  updateAvailability: async (isAvailable) => {
    try {
      const response = await api.put('/users/availability', { isAvailable });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update availability' };
    }
  },
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch conversations' };
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  sendMessage: async (data) => {
    try {
      const response = await api.post('/messages', data);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },

  createConversation: async (participantName) => {
    try {
      const response = await api.post('/messages/conversation', { participantName });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create conversation' };
    }
  },
};

// Managed Lists API
export const managedAPI = {
  addClient: async (clientId) => {
    try {
      const response = await api.post('/managed/clients', { clientId });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add client' };
    }
  },

  removeClient: async (clientId) => {
    try {
      const response = await api.delete(`/managed/clients/${clientId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove client' };
    }
  },

  updateClientStatus: async (clientId, isDone) => {
    try {
      const response = await api.put(`/managed/clients/${clientId}/status`, { isDone });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update client status' };
    }
  },

  getManagedClients: async () => {
    try {
      const response = await api.get('/managed/clients');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch managed clients' };
    }
  },

  addSpecialist: async (specialistId) => {
    try {
      const response = await api.post('/managed/specialists', { specialistId });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add specialist' };
    }
  },

  removeSpecialist: async (specialistId) => {
    try {
      const response = await api.delete(`/managed/specialists/${specialistId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove specialist' };
    }
  },

  updateSpecialistStatus: async (specialistId, isDone) => {
    try {
      const response = await api.put(`/managed/specialists/${specialistId}/status`, { isDone });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update specialist status' };
    }
  },

  getManagedSpecialists: async () => {
    try {
      const response = await api.get('/managed/specialists');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch managed specialists' };
    }
  },
};

export default {
  authAPI,
  usersAPI,
  messagesAPI,
  managedAPI,
};