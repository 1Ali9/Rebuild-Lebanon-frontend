"use client"

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { governorates, districtByGovernorate } from "../constants/data";

const Registration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const role = location.state?.role || "";
  
  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
    governorate: "",
    district: "",
    role: role // Include role in form state
  });

  // Verify valid role on component mount
  useEffect(() => {
    if (!["client", "specialist"].includes(role)) {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields are filled
    if (!formData.fullname || !formData.password || 
        !formData.governorate || !formData.district) {
      return;
    }

    if (role === "specialist") {
      // Redirect to specialist setup with collected data
      navigate("/specialist-setup", { 
        state: { 
          userData: {
            fullname: formData.fullname,
            password: formData.password,
            role: "specialist",
            governorate: formData.governorate,
            district: formData.district,
            isAvailable: true, // Default for new specialists
            specialty: "" // To be completed in setup
          }
        } 
      });
    } else {
      try {
        // Client registration data
        const clientData = {
          fullname: formData.fullname,
          password: formData.password,
          role: "client",
          governorate: formData.governorate,
          district: formData.district,
          neededSpecialists: [], // Default empty array
          isAvailable: undefined, // Explicitly undefined
          specialty: undefined // Explicitly undefined
        };
        
        // Clean data by removing undefined values
        const cleanedData = JSON.parse(JSON.stringify(clientData));
        
        await register(cleanedData);
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "governorate" && { district: "" }), // Reset district when governorate changes
    }));
  };

  const availableDistricts = formData.governorate 
    ? districtByGovernorate[formData.governorate] || [] 
    : [];

  // Check if form can be submitted
  const canSubmit = formData.fullname && 
                   formData.password && 
                   formData.governorate && 
                   formData.district;

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
            <h2>📝 Register as {role === "client" ? "Client" : "Specialist"}</h2>
            <p>Create your {role} account</p>
          </div>
          <div className="card-content">
            {error && (
              <div className="error-message">
                {error.message || "Registration failed"}
              </div>
            )}

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

              <div className="form-group">
                <label htmlFor="governorate">Governorate</label>
                <select
                  id="governorate"
                  name="governorate"
                  className="form-select"
                  value={formData.governorate}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="">Select your governorate</option>
                  {governorates.map((governorate) => (
                    <option key={governorate} value={governorate}>
                      {governorate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="district">District</label>
                <select
                  id="district"
                  name="district"
                  className="form-select"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.governorate || loading}
                  required
                >
                  <option value="">
                    {formData.governorate ? "Select your district" : "Select governorate first"}
                  </option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading...
                  </div>
                ) : (
                  role === "specialist" ? "Continue Setup" : "Register"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;