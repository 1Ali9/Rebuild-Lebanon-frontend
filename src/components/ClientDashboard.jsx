"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

const ClientDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { managedSpecialists } = useData();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Debug: Log the user object to verify data
    console.log("Current user data:", user);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]); // Added user to dependency array

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="app-container">
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
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
              <button
                className="btn btn-nav"
                onClick={() => setShowLogoutDialog(true)}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="card-content">
            {/* User Welcome Section */}
            <div className="user-welcome">
              <h3>Welcome, {user?.fullname || 'Client'}! 👋</h3>
              <div className="user-details-grid">
                <div className="detail-item">
                  <strong>Governorate:</strong>
                  <p className="detail-value" data-testid="governorate-value">
                    {user?.governorate || 'Not specified'}
                  </p>
                </div>
                <div className="detail-item">
                  <strong>District:</strong>
                  <p className="detail-value" data-testid="district-value">
                    {user?.district || 'Not specified'}
                  </p>
                </div>
                <div className="detail-item">
                  <strong>Role:</strong>
                  <p className="detail-value">Client</p>
                </div>
              </div>
            </div>

            {/* Dashboard Features Grid */}
            <div className="dashboard-grid">
              {/* Find Specialists Card */}
              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>🔍 Find Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Search for specialists in your area with advanced filters</p>
                  <Link
                    to="/browse-specialists"
                    className="btn btn-primary full-width"
                    aria-label="Browse specialists"
                  >
                    Browse Specialists
                  </Link>
                </div>
              </div>

              {/* Needed Specialists Card */}
              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>📋 Needed Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Manage your required specialist types</p>
                  <Link
                    to="/needed-specialists"
                    className="btn btn-black full-width"
                    aria-label="Manage needed specialists"
                  >
                    Manage Specialists
                  </Link>
                </div>
              </div>

              {/* Manage Specialists Card */}
              <div className="dashboard-item">
                <div className="dashboard-item-header">
                  <h3>🔧 Manage Specialists</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>Manage your current specialist list ({managedSpecialists.length})</p>
                  <Link
                    to="/manage-specialists"
                    className="btn btn-black full-width"
                    aria-label="Manage specialist list"
                  >
                    Manage Specialist List
                  </Link>
                </div>
              </div>

              {/* Messages Card */}
              <div className="dashboard-item full-width">
                <div className="dashboard-item-header">
                  <h3>💬 Messages</h3>
                </div>
                <div className="dashboard-item-content">
                  <p>View your conversations with specialists</p>
                  <Link
                    to="/conversations"
                    className="btn btn-black full-width"
                    aria-label="View messages"
                  >
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
              <button
                className="btn btn-nav"
                onClick={() => setShowLogoutDialog(false)}
                aria-label="Cancel logout"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleLogout}
                aria-label="Confirm logout"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;