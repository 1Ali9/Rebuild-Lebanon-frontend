"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { usersAPI, managedAPI } from "../services/api";
import {
  governorates,
  districtByGovernorate,
  specialties,
} from "../constants/data";

const BrowseSpecialists = () => {
  const { user } = useAuth();
  const { managedSpecialists, setManagedSpecialists } = useData();
  const navigate = useNavigate();

  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState({
    specialists: false,
    managed: false,
    initialLoad: true
  });
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    governorate: "",
    district: "",
    specialty: "",
    availableOnly: false,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, managed: true }));
        const response = await managedAPI.getManagedSpecialists();
        setManagedSpecialists(response.data?.specialists || []);
      } catch (error) {
        console.error("Error fetching managed specialists:", error);
        setError("Failed to load your specialist list");
      } finally {
        setLoading(prev => ({ ...prev, managed: false, initialLoad: false }));
      }
    };
    
    fetchInitialData();
    fetchSpecialists();
  }, []);

  useEffect(() => {
    if (!loading.initialLoad) {
      fetchSpecialists();
    }
  }, [filters]);

  const fetchSpecialists = async () => {
    try {
      setLoading(prev => ({ ...prev, specialists: true }));
      setError("");

      const params = {
        governorate: filters.governorate || undefined,
        district: filters.district || undefined,
        specialty: filters.specialty || undefined,
        isAvailable: filters.availableOnly || undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await usersAPI.getSpecialists(params);
      setSpecialists(response.data?.specialists || []);
    } catch (error) {
      setError(error.message || "Failed to fetch specialists");
      console.error("Error fetching specialists:", error);
      setSpecialists([]);
    } finally {
      setLoading(prev => ({ ...prev, specialists: false }));
    }
  };

  const fetchManagedSpecialists = async () => {
    try {
      setLoading(prev => ({ ...prev, managed: true }));
      const response = await managedAPI.getManagedSpecialists();
      setManagedSpecialists(response.data?.specialists || []);
    } catch (error) {
      console.error("Error fetching managed specialists:", error);
      setError("Failed to refresh your specialist list");
    } finally {
      setLoading(prev => ({ ...prev, managed: false }));
    }
  };

  const addSpecialistToManaged = async (specialist) => {
    try {
      setError("");
      console.log("Adding specialist:", specialist._id);

      const isAlreadyManaged = managedSpecialists.some(
        (ms) => ms._id === specialist._id
      );
      
      if (isAlreadyManaged) {
        await fetchManagedSpecialists();
        return;
      }

      const response = await managedAPI.addSpecialist(specialist._id);

      if (!response.success) {
        throw new Error(response.message || "Failed to add specialist");
      }

      setManagedSpecialists((prev) => [...prev, response.specialist]);
      setError("");
    } catch (error) {
      console.error("Error adding specialist:", error);
      
      if (error.code === 409) {
        await fetchManagedSpecialists();
        setError("This specialist was already in your list");
      } else {
        setError(error.message || "Failed to add specialist to managed list");
      }
      
      if (error.response?.data) {
        console.error("Error details:", error.response.data);
      }
    }
  };

  const updateFilters = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "governorate" && { district: "" }),
    }));
  };

  const availableDistricts = filters.governorate
    ? districtByGovernorate[filters.governorate] || []
    : [];

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="dashboard-header">
              <div className="flex items-center gap-2">
                <Link to="/client-dashboard" className="btn btn-nav">
                  ← Back
                </Link>
                <div>
                  <h2>🔍 Browse Specialists</h2>
                  <p>Find specialists based on location and specialty</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            {/* Search Filters */}
            <div className="dashboard-item mb-4">
              <div className="dashboard-item-header">
                <h3>🔍 Search Filters</h3>
              </div>
              <div className="dashboard-item-content">
                <div className="dashboard-grid">
                  <div className="form-group">
                    <label>Governorate</label>
                    <select
                      className="form-select"
                      value={filters.governorate}
                      onChange={(e) =>
                        updateFilters("governorate", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateFilters("district", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateFilters("specialty", e.target.value)
                      }
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
                    <label>
                      <input
                        type="checkbox"
                        checked={filters.availableOnly}
                        onChange={(e) =>
                          updateFilters("availableOnly", e.target.checked)
                        }
                      />
                      Available only
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              <h3 className="mb-4">
                {loading.specialists || loading.initialLoad
                  ? "Loading specialists..."
                  : `Found ${specialists.length} specialist${
                      specialists.length !== 1 ? "s" : ""
                    }`}
              </h3>

              {loading.initialLoad ? (
                <div className="text-center p-4">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading specialist data...
                  </div>
                </div>
              ) : (
                <div className="dashboard-grid">
                  {specialists.map((specialist) => {
                    const isManaged = managedSpecialists.some(
                      (ms) => ms._id === specialist._id
                    );
                    
                    return (
                      <div key={specialist._id} className="dashboard-item">
                        <div className="dashboard-item-header">
                          <div className="flex justify-between items-start">
                            <h4>{specialist.fullname}</h4>
                            <span
                              className={`badge ${
                                specialist.isAvailable
                                  ? "badge-available"
                                  : "badge-unavailable"
                              }`}
                            >
                              {specialist.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </div>
                          <p>{specialist.specialty}</p>
                        </div>
                        <div className="dashboard-item-content">
                          <p className="mb-4">
                            <strong>Location:</strong> {specialist.district},{" "}
                            {specialist.governorate}
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-primary flex-1"
                              onClick={() =>
                                navigate(`/chat/${specialist.fullname}`)
                              }
                            >
                              💬 Message
                            </button>
                            <button
                              className={`btn btn-black flex-1 ${
                                isManaged ? "added-specialist" : ""
                              }`}
                              onClick={() => addSpecialistToManaged(specialist)}
                              disabled={isManaged || loading.managed}
                            >
                              {isManaged
                                ? "✓ Added"
                                : "+ Add Specialist"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading.initialLoad && !loading.specialists && specialists.length === 0 && (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <p>No specialists found matching your criteria.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseSpecialists;