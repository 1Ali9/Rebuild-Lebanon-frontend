"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { specialties } from "../constants/data"

const SpecialistSetup = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()

  const userData = location.state?.userData || {}
  const [specialty, setSpecialty] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const completeUserData = {
      ...userData,
      specialty,
      isAvailable: true,
    }

    try {
      await register(completeUserData)
    } catch (error) {
      console.error("Specialist registration failed:", error)
    }
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="auth-card">
          <div className="card-header text-center">
            <h2>🔧 Specialist Setup</h2>
            <p>Select your specialty to complete registration</p>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Welcome, {userData.fullname}! 👋</label>
                <div className="user-info">
                  <p>
                    <strong>Governorate:</strong> {userData.governorate}
                  </p>
                  <p>
                    <strong>District:</strong> {userData.district}
                  </p>
                  <p>
                    <strong>Role:</strong> Specialist
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialty">Your Specialty</label>
                <select
                  id="specialty"
                  className="form-select"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Select your specialty</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-nav"
                  onClick={() => navigate("/registration")}
                  disabled={loading}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      Loading...
                    </div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecialistSetup
