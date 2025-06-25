"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

const ClientDashboard = () => {
  const { user, logout } = useAuth()
  const { managedSpecialists } = useData()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
  }

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="dashboard-header">
              <div>
                <h2>👥 Client Dashboard</h2>
                <p>Welcome to your client portal</p>
              </div>
              <button className="btn btn-nav" onClick={() => setShowLogoutDialog(true)}>
                Logout
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="user-welcome">
              <h3>Welcome, {user?.fullname}! 👋</h3>
              <div className="user-details">
                <div>
                  <strong>Governorate:</strong>
                  <p>{user?.governorate}</p>
                </div>
                <div>
                  <strong>District:</strong>
                  <p>{user?.district}</p>
                </div>
                <div>
                  <strong>Role:</strong>
                  <p>Client</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>🔍 Find Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Search for specialists in your area with advanced filters</p>
                  <Link to="/browse-specialists" className="btn btn-primary full-width">
                    Browse Specialists
                  </Link>
                </div>
              </div>

              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>📋 Needed Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Manage your required specialist types</p>
                  <Link to="/needed-specialists" className="btn btn-black full-width">
                    Manage Specialists
                  </Link>
                </div>
              </div>

              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>🔧 Manage Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Manage your current specialist list ({managedSpecialists.length} specialists)</p>
                  <Link to="/manage-specialists" className="btn btn-black full-width">
                    Manage Specialist List
                  </Link>
                </div>
              </div>

              <div className="dashboard-item full-width">
                <div className="dashboard-item-header">
                  <h3>💬 Messages</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>View your conversations with specialists</p>
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

export default ClientDashboard
