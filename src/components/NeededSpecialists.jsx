"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { usersAPI } from "../services/api"
import { specialties } from "../constants/data"

const NeededSpecialists = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

  // Initialize neededSpecialists if empty
  useEffect(() => {
  if (user?.role === 'client' && !initialized) {
    const currentSpecialists = user.neededSpecialists || []
    
    // Create a map for quick lookup
    const specialistsMap = new Map(
      currentSpecialists.map(spec => [spec.name, spec.isNeeded])
    ) // Added missing parenthesis here
    
    // Initialize all specialties with their current state or default false
    const initializedSpecialists = specialties.map(name => ({
      name,
      isNeeded: specialistsMap.has(name) ? specialistsMap.get(name) : false
    }))

    updateUser({
      ...user,
      neededSpecialists: initializedSpecialists
    })
    setInitialized(true)
  }
}, [user, initialized, updateUser])

  const toggleNeededSpecialist = (specialtyName) => {
    if (!initialized) return
    
    const updatedSpecialists = user.neededSpecialists.map(spec =>
      spec.name === specialtyName ? { ...spec, isNeeded: !spec.isNeeded } : spec
    )

    updateUser({
      ...user,
      neededSpecialists: updatedSpecialists
    })
  }

  const saveChanges = async () => {
  if (!initialized) return;
  
  try {
    setLoading(true);
    setError("");
    
    // Validate at least one specialist is selected
    const hasSelected = user.neededSpecialists.some(spec => spec.isNeeded);
    if (!hasSelected) {
      setError("Please select at least one specialist type");
      return;
    }

    // Send the data properly wrapped
    const response = await usersAPI.updateNeededSpecialists(user.neededSpecialists);
    console.log('Update successful:', response);
    navigate("/client-dashboard");
  } catch (error) {
    console.error('Full error:', error);
    setError(error.message || "Failed to update needed specialists");
  } finally {
    setLoading(false);
  }
};

  if (user?.role !== 'client') {
    return (
      <div className="app-container">
        <div className="dashboard-container">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Access Denied</h2>
            </div>
            <div className="card-content">
              <p>This page is only available for clients.</p>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
                const specialist = user.neededSpecialists?.find(spec => spec.name === specialty)
                const isNeeded = specialist?.isNeeded || false
                
                return (
                  <div key={specialty} className={`dashboard-item ${isNeeded ? "needed-specialist" : ""}`}>
                    <div className="dashboard-item-content">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4>{specialty}</h4>
                          <p>{isNeeded ? "Currently needed" : "Not needed"}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isNeeded}
                          onChange={() => toggleNeededSpecialist(specialty)}
                          disabled={!initialized || loading}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="form-actions mt-4">
              <button
                onClick={saveChanges}
                className="btn btn-primary"
                disabled={!initialized || loading}
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Saving...
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