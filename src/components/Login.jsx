"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
  })
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">🇱🇧 Rebuild Lebanon</h1>
          <Link to="/" className="btn btn-nav">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="main-content">
        <div className="auth-card">
          <div className="card-header text-center">
            <h2>🔐 Login</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="fullname">Full Name</label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  className="form-input"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/registration" className="btn-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
