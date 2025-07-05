"use client"

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { specialties } from "../constants/data";

const SpecialistSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, loading, error, setError } = useAuth();

  // Get initial data from registration
  const userData = location.state?.userData || {};
  
  // Form state
  const [formData, setFormData] = useState({
    specialty: "",
    isAvailable: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.specialty) {
      setError("Please select your specialty");
      return;
    }

    try {
      // Prepare complete registration data
      const registrationData = {
        ...userData,  // Contains: fullname, password, governorate, district
        role: "specialist",
        specialty: formData.specialty,
        isAvailable: Boolean(formData.isAvailable),
        neededSpecialists: undefined  // Explicitly undefined for specialists
      };

      await register(registrationData);
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle validation errors
      if (err.code === 400 && err.data?.errors) {
        const errorMessages = Object.values(err.data.errors)
          .map(error => error.message)
          .join(". ");
        setError(errorMessages);
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="auth-card">
          <div className="card-header text-center">
            <h2>🔧 Specialist Setup</h2>
            <p>Complete your specialist profile</p>
          </div>
          
          <div className="card-content">
            {error && (
              <div className="error-message mb-4">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form">
              {/* User Info Section */}
              <div className="form-group">
                <label className="text-lg font-medium">Welcome, {userData.fullname || 'Specialist'}! 👋</label>
                <div className="user-details-grid mt-2">
                  <div className="detail-item">
                    <strong>Governorate:</strong>
                    <p>{userData.governorate || 'Not specified'}</p>
                  </div>
                  <div className="detail-item">
                    <strong>District:</strong>
                    <p>{userData.district || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Specialty Selection */}
              <div className="form-group">
                <label htmlFor="specialty" className="required">
                  Your Specialty
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  className="form-select"
                  value={formData.specialty}
                  onChange={handleChange}
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

              {/* Availability Toggle */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    disabled={loading}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Available for immediate work
                </label>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-nav"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.specialty}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
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
  );
};

export default SpecialistSetup;