"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import { usersAPI } from "../services/api"

const SpecialistDashboard = () => {
  const { user, logout, updateUser } = useAuth()
  const { managedClients } = useData()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
  }

  const toggleAvailability = async () => {
    try {
      const newAvailability = !user.isAvailable
      await usersAPI.updateAvailability(newAvailability)
      updateUser({ ...user, isAvailable: newAvailability })
    } catch (error) {
      console.error("Failed to update availability:", error)
    }
  }

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="dashboard-header">
              <div>
                <h2>🔧 Specialist Dashboard</h2>
                <p>Manage your specialist profile and find clients</p>
              </div>
              <button className="btn btn-nav" onClick={() => setShowLogoutDialog(true)}>
                Logout
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="specialist-welcome">
              <div className="specialist-header">
                <h3>Welcome, {user?.fullname}! 👋</h3>
                <div className="availability-toggle">
                  <label htmlFor="availability">Available</label>
                  <input
                    type="checkbox"
                    id="availability"
                    checked={user?.isAvailable || false}
                    onChange={toggleAvailability}
                  />
                </div>
              </div>
              <div className="specialist-details">
                <div>
                  <strong>Specialty:</strong>
                  <p>{user?.specialty}</p>
                </div>
                <div>
                  <strong>Governorate:</strong>
                  <p>{user?.governorate}</p>
                </div>
                <div>
                  <strong>District:</strong>
                  <p>{user?.district}</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <span className={`badge ${user?.isAvailable ? "badge-available" : "badge-unavailable"}`}>
                    {user?.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>👥 Browse Clients</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Find clients in your area</p>
                  <Link to="/browse-clients" className="btn btn-primary full-width">
                    Find Clients
                  </Link>
                </div>
              </div>

              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>📋 Manage Clients</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Manage your current client list ({managedClients.length} clients)</p>
                  <Link to="/manage-clients" className="btn btn-black full-width">
                    Manage Client List
                  </Link>
                </div>
              </div>

              <div className="dashboard-item full-width">
                <div className="dashboard-item-header">
                  <h3>💬 Messages</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>View your conversations with clients</p>
                  <Link to="/conversations" className="btn btn-black full-width">
                    View Messages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to logout? You will be redirected to the welcome page.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-nav" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpecialistDashboard
