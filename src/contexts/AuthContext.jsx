"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem("token")
    if (token) {
      const mockUser = {
        _id: "user123",
        fullname: "Demo User",
        role: "client",
        governorate: "Beirut",
        district: "Beirut",
        isAvailable: true,
        neededSpecialists: [],
      }
      setUser(mockUser)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError("")

      // Mock login - replace with real API call
      const mockResponse = {
        token: "mock-token-123",
        user: {
          _id: "user123",
          fullname: credentials.fullname,
          role: credentials.fullname.toLowerCase().includes("specialist") ? "specialist" : "client",
          governorate: "Beirut",
          district: "Beirut",
          specialty: credentials.fullname.toLowerCase().includes("specialist") ? "Civil Engineer" : undefined,
          isAvailable: true,
          neededSpecialists: [],
        },
      }

      localStorage.setItem("token", mockResponse.token)
      setUser(mockResponse.user)

      // Navigate based on user role
      if (mockResponse.user.role === "specialist") {
        navigate("/specialist-dashboard")
      } else {
        navigate("/client-dashboard")
      }

      return mockResponse
    } catch (error) {
      setError(error.message || "Login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError("")

      // Mock registration - replace with real API call
      const mockResponse = {
        token: "mock-token-123",
        user: {
          _id: "user123",
          ...userData,
          neededSpecialists: userData.neededSpecialists || [],
        },
      }

      localStorage.setItem("token", mockResponse.token)
      setUser(mockResponse.user)

      // Navigate based on user role
      if (mockResponse.user.role === "specialist") {
        navigate("/specialist-dashboard")
      } else {
        navigate("/client-dashboard")
      }

      return mockResponse
    } catch (error) {
      setError(error.message || "Registration failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Mock logout - replace with real API call
      localStorage.removeItem("token")
      setUser(null)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
