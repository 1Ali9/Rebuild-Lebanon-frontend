"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { usersAPI, managedAPI } from "../services/api";
import { governorates, districtByGovernorate } from "../constants/data";
import mongoose from 'mongoose';

const BrowseClients = () => {
  const { user } = useAuth();
  const { managedClients, setManagedClients } = useData();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    governorate: "",
    district: "",
    needsMySpecialty: false,
  });

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getClients({
        ...filters,
        specialty: user.specialty, // Pass user's specialty for filtering
      });
      setClients(
        Object.values(
          Array.isArray(response.data)
            ? response.data
            : response.data.clients || {}
        )
      );
    } catch (error) {
      setError("Failed to fetch clients");
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

// BrowseClients.jsx
const addClientToManaged = async (client) => {
  try {
    setError("");
    
    // Debug log
    console.log("[DEBUG] Adding client:", {
      id: client._id,
      type: typeof client._id,
      isValid: mongoose.Types.ObjectId.isValid(client._id)
    });

    // Validation
    if (!client._id) {
      throw new Error("Client ID is missing");
    }

    if (!mongoose.Types.ObjectId.isValid(client._id)) {
      throw new Error("Invalid client ID format");
    }

    // Check if already managed
    if (managedClients.some(mc => mc._id === client._id)) {
      setError("Client is already in your managed list");
      return;
    }

    // API call
    const response = await managedAPI.addClient({
      clientId: client._id.toString() // Ensure string format
    });

    // Update local state
    setManagedClients(prev => [
      ...prev,
      {
        _id: client._id,
        fullname: client.fullname,
        governorate: client.governorate,
        district: client.district,
        isDone: false,
        dateAdded: new Date(),
        neededSpecialists: client.neededSpecialists
      }
    ]);

  } catch (error) {
    console.error("[ERROR] Failed to add client:", error);
    setError(error.message || "Failed to add client");
    
    // Show detailed error if available
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
            <div className="flex items-center gap-2">
              <Link to="/specialist-dashboard" className="btn btn-nav">
                ← Back
              </Link>
              <div>
                <h2>👥 Browse Clients</h2>
                <p>Find clients in your area</p>
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
                    <label>
                      <input
                        type="checkbox"
                        checked={filters.needsMySpecialty}
                        onChange={(e) =>
                          updateFilters("needsMySpecialty", e.target.checked)
                        }
                      />
                      Needs my specialty ({user.specialty})
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              <h3 className="mb-4">
                {loading
                  ? "Loading..."
                  : `Found ${clients.length} client${
                      clients.length !== 1 ? "s" : ""
                    }`}
              </h3>

              {loading ? (
                <div className="text-center p-4">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Loading...
                  </div>
                </div>
              ) : (
                <div className="dashboard-grid">
                  {clients.map((client) => (
                    <div key={client._id} className="dashboard-item">
                      <div className="dashboard-item-header">
                        <h4>{client.fullname}</h4>
                        <p>
                          {client.district}, {client.governorate}
                        </p>
                      </div>
                      <div className="dashboard-item-content">
                        <div className="mb-4">
                          <h5>Needed Specialists:</h5>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {client.neededSpecialists
                              ?.filter((spec) => spec.isNeeded)
                              .map((spec) => (
                                <span
                                  key={spec.name}
                                  className={`badge ${
                                    spec.name === user.specialty
                                      ? "badge-available"
                                      : "badge-unavailable"
                                  }`}
                                >
                                  {spec.name}
                                </span>
                              ))}
                            {client.neededSpecialists?.filter(
                              (spec) => spec.isNeeded
                            ).length === 0 && (
                              <span className="badge badge-unavailable">
                                No specific needs listed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-primary flex-1"
                            onClick={() => navigate(`/chat/${client.fullname}`)}
                          >
                            💬 Message
                          </button>
                          <button
                            className="btn btn-black flex-1"
                            onClick={() => addClientToManaged(client)}
                            disabled={managedClients.some(
                              (mc) => mc._id === client._id
                            )}
                          >
                            {managedClients.some((mc) => mc._id === client._id)
                              ? "✓ Added"
                              : "+ Add Client"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && clients.length === 0 && (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <p>No clients found matching your criteria.</p>
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

export default BrowseClients;
