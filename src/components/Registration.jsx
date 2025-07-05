"use client"

import { useState } from "react";
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
    district: ""
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.role === "specialist") {
    navigate("/specialist-setup", { 
      state: { 
        userData: {
          fullname: formData.fullname,
          password: formData.password,
          role: "specialist",
          governorate: formData.governorate,
          district: formData.district,
          isAvailable: true,
          specialty: ""
        }
      } 
    });
  } else {
    try {
      // Create PURIFIED client data object
      const clientData = {
        fullname: formData.fullname,
        password: formData.password,
        role: "client",
        governorate: formData.governorate,
        district: formData.district,
        neededSpecialists: [],
        // Explicitly set specialist fields to undefined
        isAvailable: undefined,
        specialty: undefined
      };
      
      // Stringify and parse to remove undefined values
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
      ...(name === "governorate" && { district: "" }),
    }));
  };

  const availableDistricts = formData.governorate 
    ? districtByGovernorate[formData.governorate] || [] 
    : [];

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
                disabled={loading}
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