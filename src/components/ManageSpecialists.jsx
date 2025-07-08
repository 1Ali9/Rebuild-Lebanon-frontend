"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import { managedAPI } from "../services/api"
import { governorates, districtByGovernorate, specialties } from "../constants/data"

const ManageSpecialists = () => {
  const { user } = useAuth()
  const { managedSpecialists, setManagedSpecialists } = useData()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    searchTerm: "",
    governorate: "",
    district: "",
    specialty: "",
    showDoneOnly: false,
    showPendingOnly: false,
  })

  useEffect(() => {
    fetchManagedSpecialists()
  }, [])

 const fetchManagedSpecialists = async () => {
  try {
    setLoading(true);
    setError("");
    
    const response = await managedAPI.getManagedSpecialists();
    
    // Handle both response formats for backward compatibility
    const specialistsData = response.data?.specialists || response.specialists || [];
    
    setManagedSpecialists(specialistsData);
  } catch (error) {
    console.error("Error fetching managed specialists:", error);
    setError(error.message || "Failed to fetch managed specialists");
    setManagedSpecialists([]); // Reset to empty array on error
  } finally {
    setLoading(false);
  }
};

  const toggleSpecialistDone = async (specialistId) => {
    try {
      const specialist = managedSpecialists.find((s) => s._id === specialistId)
      const newStatus = !specialist.isDone

      await managedAPI.updateSpecialistStatus(specialistId, newStatus)

      setManagedSpecialists((prev) => prev.map((s) => (s._id === specialistId ? { ...s, isDone: newStatus } : s)))
    } catch (error) {
      setError("Failed to update specialist status")
      console.error("Error updating specialist status:", error)
    }
  }

  const removeSpecialistFromManaged = async (specialistId) => {
    try {
      await managedAPI.removeSpecialist(specialistId)
      setManagedSpecialists((prev) => prev.filter((s) => s._id !== specialistId))
    } catch (error) {
      setError("Failed to remove specialist")
      console.error("Error removing specialist:", error)
    }
  }

  const updateFilters = (field, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value }

      if (field === "governorate") {
        updated.district = ""
      }

      if (field === "showDoneOnly" && value) {
        updated.showPendingOnly = false
      }
      if (field === "showPendingOnly" && value) {
        updated.showDoneOnly = false
      }

      return updated
    })
  }

  const getFilteredSpecialists = () => {
    let filtered = [...managedSpecialists]

    if (filters.searchTerm) {
      filtered = filtered.filter((specialist) =>
        specialist.fullname.toLowerCase().includes(filters.searchTerm.toLowerCase()),
      )
    }

    if (filters.governorate) {
      filtered = filtered.filter((specialist) => specialist.governorate === filters.governorate)
    }

    if (filters.district) {
      filtered = filtered.filter((specialist) => specialist.district === filters.district)
    }

    if (filters.specialty) {
      filtered = filtered.filter((specialist) => specialist.specialty === filters.specialty)
    }

    if (filters.showDoneOnly) {
      filtered = filtered.filter((specialist) => specialist.isDone)
    }

    if (filters.showPendingOnly) {
      filtered = filtered.filter((specialist) => !specialist.isDone)
    }

    return filtered
  }

  const filteredSpecialists = getFilteredSpecialists()
  const availableDistricts = filters.governorate ? districtByGovernorate[filters.governorate] || [] : []

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
                <h2>🔧 Manage Specialists</h2>
                <p>Manage your current specialist list and track progress</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            {/* Search and Filter Section */}
            <div className="dashboard-item mb-4">
              <div className="dashboard-item-header">
                <h3>🔍 Search & Filter Specialists</h3>
              </div>
              <div className="dashboard-item-content">
                <div className="dashboard-grid">
                  <div className="form-group">
                    <label>Search by Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search specialist name..."
                      value={filters.searchTerm}
                      onChange={(e) => updateFilters("searchTerm", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Governorate</label>
                    <select
                      className="form-select"
                      value={filters.governorate}
                      onChange={(e) => updateFilters("governorate", e.target.value)}
                    >
                      <option value="">All Governorates</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>District</label>
                    <select
                      className="form-select"
                      value={filters.district}
                      onChange={(e) => updateFilters("district", e.target.value)}
                      disabled={!filters.governorate}
                    >
                      <option value="">All Districts</option>
                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Specialty</label>
                    <select
                      className="form-select"
                      value={filters.specialty}
                      onChange={(e) => updateFilters("specialty", e.target.value)}
                    >
                      <option value="">All Specialties</option>
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status Filter</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={filters.showDoneOnly}
                          onChange={(e) => updateFilters("showDoneOnly", e.target.checked)}
                        />
                        Done Only
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={filters.showPendingOnly}
                          onChange={(e) => updateFilters("showPendingOnly", e.target.checked)}
                        />
                        Pending Only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialist List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3>
                  Specialist List ({filteredSpecialists.length} of {managedSpecialists.length} specialists)
                </h3>
                <div className="flex gap-2">
                  <span className="badge badge-available">
                    ✓ Done: {managedSpecialists.filter((s) => s.isDone).length}
                  </span>
                  <span className="badge badge-unavailable">
                    ⏳ Pending: {managedSpecialists.filter((s) => !s.isDone).length}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="text-center p-4">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading...
                  </div>
                </div>
              ) : managedSpecialists.length === 0 ? (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <div className="mb-4">🔧</div>
                    <p className="mb-4">No specialists in your managed list yet</p>
                    <Link to="/browse-specialists" className="btn btn-primary">
                      Browse Specialists to Add
                    </Link>
                  </div>
                </div>
              ) : filteredSpecialists.length === 0 ? (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <p>No specialists match your current filters.</p>
                  </div>
                </div>
              ) : (
                <div className="dashboard-grid">
                  {filteredSpecialists.map((specialist) => (
                    <div key={specialist._id} className={`dashboard-item ${specialist.isDone ? "client-done" : ""}`}>
                      <div className="dashboard-item-header">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="flex items-center gap-2">
                              {specialist.fullname}
                              {specialist.isDone && <span className="text-green-600">✓</span>}
                            </h4>
                            <p>{specialist.specialty}</p>
                            <p className="text-sm">
                              {specialist.district}, {specialist.governorate}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`badge ${specialist.isDone ? "badge-available" : "badge-unavailable"}`}>
                              {specialist.isDone ? "Done" : "Pending"}
                            </span>
                            {specialist.isAvailable !== undefined && (
                              <span
                                className={`badge ${specialist.isAvailable ? "badge-available" : "badge-unavailable"}`}
                              >
                                {specialist.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="dashboard-item-content">
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            Added: {new Date(specialist.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className={`btn ${specialist.isDone ? "btn-secondary" : "btn-primary"} flex-1`}
                            onClick={() => toggleSpecialistDone(specialist._id)}
                          >
                            {specialist.isDone ? "Mark Pending" : "Mark Done"}
                          </button>
                          <button className="btn btn-nav" onClick={() => navigate(`/chat/${specialist.fullname}`)}>
                            💬
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => removeSpecialistFromManaged(specialist._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageSpecialists
