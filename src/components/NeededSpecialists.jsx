"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { usersAPI } from "../services/api"
import { specialties } from "../constants/data"

const NeededSpecialists = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleNeededSpecialist = (specialtyName) => {
    const updatedSpecialists =
      user.neededSpecialists?.map((spec) =>
        spec.name === specialtyName ? { ...spec, isNeeded: !spec.isNeeded } : spec,
      ) || []

    updateUser({
      ...user,
      neededSpecialists: updatedSpecialists,
    })
  }

  const saveChanges = async () => {
    try {
      setLoading(true)
      setError("")
      await usersAPI.updateNeededSpecialists(user.neededSpecialists || [])
      navigate("/client-dashboard")
    } catch (error) {
      setError("Failed to update needed specialists")
      console.error("Error updating needed specialists:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Link to="/client-dashboard" className="btn btn-nav">
                ← Back
              </Link>
              <div>
                <h2>📋 Manage Needed Specialists</h2>
                <p>Select the types of specialists you need for your projects</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-grid">
              {specialties.map((specialty) => {
                const isNeeded = user.neededSpecialists?.find((spec) => spec.name === specialty)?.isNeeded || false
                return (
                  <div key={specialty} className={`dashboard-item ${isNeeded ? "needed-specialist" : ""}`}>
                    <div className="dashboard-item-content">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4>{specialty}</h4>
                          <p>{isNeeded ? "Currently needed" : "Not needed"}</p>
                        </div>
                        <input type="checkbox" checked={isNeeded} onChange={() => toggleNeededSpecialist(specialty)} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="form-actions mt-4">
              <button onClick={saveChanges} className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
              <Link to="/client-dashboard" className="btn btn-nav">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NeededSpecialists
