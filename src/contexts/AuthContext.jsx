import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to clean user data based on role
const sanitizeUserData = (userData) => {
  if (!userData) return userData;

  const cleanedData = { ...userData };

  // Remove specialist-specific fields for non-specialists
  if (cleanedData.role !== 'specialist') {
    cleanedData.isAvailable = undefined;
    cleanedData.specialty = undefined;
  }

  // Ensure clients have neededSpecialists array
  if (cleanedData.role === 'client' && !cleanedData.neededSpecialists) {
    cleanedData.neededSpecialists = [];
  }

  return cleanedData;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Verify token and initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          isMounted && setInitialLoading(false);
          return;
        }

        const userData = await authAPI.verifyToken();
        if (isMounted && userData?.user) {
          setUser(sanitizeUserData(userData.user));
        } else {
          handleCleanup();
        }
      } catch (err) {
        handleCleanup(err);
      } finally {
        isMounted && setInitialLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = (response) => {
    const { token, user } = response;
    const cleanedUser = sanitizeUserData(user);
    
    localStorage.setItem("token", token);
    setUser(cleanedUser);
    return cleanedUser;
  };

  const handleCleanup = (error = null) => {
    localStorage.removeItem("token");
    setUser(null);
    if (error) {
      console.error("Auth error:", error);
      setError(error.message || "Session expired");
    }
  };

  const redirectByRole = (role) => {
    navigate(role === "specialist" 
      ? "/specialist-dashboard" 
      : "/client-dashboard",
      { replace: true }
    );
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError("");
      const response = await authAPI.login(credentials);
      const user = handleAuthSuccess(response);
      redirectByRole(user.role);
      return user;
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError("");
      const cleanedData = sanitizeUserData(userData);
      const response = await authAPI.register(cleanedData);
      const user = handleAuthSuccess(response);
      redirectByRole(user.role);
      return user;
    } catch (error) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } finally {
      handleCleanup();
      navigate("/", { replace: true });
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await authAPI.verifyToken();
      if (response?.user) {
        setUser(sanitizeUserData(response.user));
        return true;
      }
      return false;
    } catch (error) {
      handleCleanup(error);
      return false;
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => sanitizeUserData({
      ...prev,
      ...updatedData
    }));
  };

  const value = useMemo(() => ({
    user,
    loading: loading || initialLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    setError
  }), [user, loading, initialLoading, error]);

  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};