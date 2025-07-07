import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3500/api";

// Create axios instance with enhanced configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN"
});

// Enhanced request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token for non-auth endpoints
    if (!config.url?.includes("/auth")) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Special handling for PUT/POST requests
    if (["put", "post"].includes(config.method?.toLowerCase())) {
      config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject({
      ...error,
      isNetworkError: true,
      message: "Request configuration failed"
    });
  }
);

// Enhanced response interceptor with CORS/network error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Standardize successful responses
    return {
      ...response,
      data: {
        success: true,
        ...response.data,
        user: response.data?.user 
          ? {
              ...response.data.user,
              governorate: response.data.user.governorate,
              district: response.data.user.district,
              role: response.data.user.role
            }
          : undefined
      }
    };
  },
  (error) => {
    // Handle network/CORS errors specifically
    if (error.code === "ERR_NETWORK" || error.message.includes("Failed to fetch")) {
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: "Network error. Please check your connection.",
        shouldRetry: true
      });
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
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
      originalError: error,
      isNetworkError: error.isNetworkError || false
    };

    // Enhanced validation error handling
    if (error.response?.status === 400 && error.response.data?.errors) {
      formattedError.validationErrors = Object.entries(error.response.data.errors)
        .map(([field, err]) => `${field}: ${err.message}`)
        .join(", ");
      formattedError.message = "Validation failed";
    }

    return Promise.reject(formattedError);
  }
);

// Enhanced request data preparation
// api.js
const prepareRequestData = (method, data, endpoint) => {
  if (method.toLowerCase() === "get") {
    return { params: data };
  }

  // For POST /managed/clients, send the data as is (already the ID string)
  if (method.toLowerCase() === "post" && endpoint === "/managed/clients") {
    return { data: data }; // Just send the ID directly
  }

  if (method.toLowerCase() === "patch" && endpoint === "/users/needed-specialists") {
    return { data };
  }

  if (data && typeof data === "object") {
    return {
      data: {
        ...data,
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true
      }
    };
  }

  return { data };
};

// Enhanced endpoint creator with retry logic
// api.js
const createEndpoint = (method, endpoint, defaultError, options = {}) => {
  return async (data = null, params = null, retries = 1) => {
    try {
      const config = {
        method,
        url: endpoint,
        ...prepareRequestData(method, options.dataTransformer ? options.dataTransformer(data) : data, endpoint)
      };

      const response = await axiosInstance(config);
      
      if (response.data?.user) {
        response.data.user = {
          ...response.data.user,
          governorate: response.data.user.governorate,
          district: response.data.user.district,
          role: response.data.user.role
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`API ${method.toUpperCase()} ${endpoint} failed:`, error);

      if (error.shouldRetry && retries > 0) {
        console.log(`Retrying ${endpoint}... (${retries} attempts left)`);
        return createEndpoint(method, endpoint, defaultError, options)(data, params, retries - 1);
      }

      throw {
        ...error,
        endpoint,
        method,
        message: error.message || defaultError,
        timestamp: new Date().toISOString()
      };
    }
  };
};

// API Endpoints with enhanced configuration
export const authAPI = {
  login: createEndpoint("post", "/auth/login", "Login failed"),
  register: createEndpoint("post", "/auth/register", "Registration failed"),
  logout: createEndpoint("post", "/auth/logout", "Logout failed"),
  verifyToken: createEndpoint("get", "/auth/verify", "Token verification failed"),
  refreshToken: createEndpoint("post", "/auth/refresh", "Token refresh failed")
};

export const usersAPI = {
  getProfile: createEndpoint("get", "/users/profile", "Failed to fetch profile"),
  getSpecialists: createEndpoint("get", "/users/specialists", "Failed to fetch specialists"),
  getClients: createEndpoint("get", "/users/clients", "Failed to fetch clients"),
  updateProfile: createEndpoint("put", "/users/profile", "Failed to update profile"),
  // In api.js
// api.js
updateNeededSpecialists: createEndpoint(
  "patch",
  "/users/needed-specialists",
  "Failed to update specialists",
  {
    dataTransformer: data => ({ neededSpecialists: data }),
    bypassPrepareData: true // Add this to skip prepareRequestData
  }
),
  updateAvailability: createEndpoint("put", "/users/availability", "Failed to update availability", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
};

export const messagesAPI = {
  getConversations: createEndpoint("get", "/messages/conversations", "Failed to fetch conversations"),
  getMessages: createEndpoint("get", "/messages/conversation/:id", "Failed to fetch messages"),
  sendMessage: createEndpoint("post", "/messages", "Failed to send message"),
  createConversation: createEndpoint("post", "/messages/conversations", "Failed to create conversation"),
  markAsRead: createEndpoint("patch", "/messages/:id/read", "Failed to mark as read")
};

export const managedAPI = {
addClient: createEndpoint(
  "post", 
  "/managed/clients", 
  "Failed to add client",
  {
    dataTransformer: (data) => ({ clientId: data.clientId || data }) // Handles both formats
  }
),
  removeClient: createEndpoint("delete", "/managed/clients/:id", "Failed to remove client"),
  removeClient: createEndpoint("delete", "/managed/clients/:id", "Failed to remove client"),
  updateClientStatus: createEndpoint(
    "patch",
    "/managed/relationships/:relationshipId/status",
    "Failed to update client status",
    {
      dataTransformer: (isDone) => ({ isDone }), // Ensure { isDone } is sent
    }
  ),
  getManagedClients: createEndpoint("get", "/managed/clients", "Failed to fetch clients"),
  addSpecialist: createEndpoint("post", "/managed/specialists", "Failed to add specialist"),
  removeSpecialist: createEndpoint("delete", "/managed/specialists/:id", "Failed to remove specialist"),
  updateSpecialistStatus: createEndpoint("patch", "/managed/specialists/:id/status", "Failed to update specialist status"),
  getManagedSpecialists: createEndpoint("get", "/managed/specialists", "Failed to fetch specialists"),
  getStatistics: createEndpoint("get", "/managed/statistics", "Failed to fetch statistics")
};

// Enhanced debug utilities
export const debugAPI = {
  printUserData: () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.group("User Debug Info");
      console.log("Current token:", token);
      axiosInstance.get("/auth/verify")
        .then(res => {
          console.log("User data:", res.data?.user);
          console.groupEnd();
        })
        .catch(err => {
          console.error("Debug error:", err);
          console.groupEnd();
        });
    } else {
      console.log("No token found in localStorage");
    }
  },
  pingServer: () => {
    return axiosInstance.get("/health")
      .then(res => console.log("Server health:", res.data))
      .catch(err => console.error("Server ping failed:", err));
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