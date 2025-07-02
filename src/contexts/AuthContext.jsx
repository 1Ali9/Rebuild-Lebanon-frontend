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
    const verifyToken = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${process.env.VITE_API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "Token verification failed")
        }
        setUser(data.user)
      } catch (err) {
        setError(err.message)
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${process.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
      localStorage.setItem("token", data.token)
      setUser(data.user)
      navigate(data.user.role === "specialist" ? "/specialist-dashboard" : "/client-dashboard")
      return data
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
      const response = await fetch(`${process.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }
      localStorage.setItem("token", data.token)
      setUser(data.user)
      navigate(data.user.role === "specialist" ? "/specialist-dashboard" : "/client-dashboard")
      return data
    } catch (error) {
      setError(error.message || "Registration failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${process.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) {
        throw new Error("Logout failed")
      }
      localStorage.removeItem("token")
      setUser(null)
      navigate("/")
    } catch (error) {
      setError(error.message || "Logout failed")
    } finally {
      setLoading(false)
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