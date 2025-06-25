"use client"

import { Link, useNavigate } from "react-router-dom"

const Welcome = () => {
  const navigate = useNavigate()

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">🇱🇧 Rebuild Lebanon</h1>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-nav">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="welcome-card">
          <div className="card-header text-center">
            <h1 className="welcome-title">🇱🇧 Rebuild Lebanon</h1>
            <p className="welcome-description">
              Connecting clients with skilled specialists to rebuild our beautiful Lebanon
            </p>
          </div>
          <div className="card-content">
            <div className="role-cards">
              <div className="role-card">
                <div className="role-card-header">
                  <h3>👥 For Clients</h3>
                </div>
                <div className="role-card-content">
                  <p>Find skilled specialists in your area for construction, renovation, and repair projects.</p>
                  <button
                    className="btn btn-primary full-width"
                    onClick={() => navigate("/registration", { state: { role: "client" } })}
                  >
                    Register as Client
                  </button>
                </div>
              </div>

              <div className="role-card">
                <div className="role-card-header">
                  <h3>🔧 For Specialists</h3>
                </div>
                <div className="role-card-content">
                  <p>Connect with clients who need your expertise and grow your business.</p>
                  <button
                    className="btn btn-primary full-width"
                    onClick={() => navigate("/registration", { state: { role: "specialist" } })}
                  >
                    Register as Specialist
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="btn-link">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Welcome
