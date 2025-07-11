"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { managedAPI } from "../services/api";
import { governorates, districtByGovernorate } from "../constants/data";

const ManageClients = () => {
  const { user } = useAuth();
  const { managedClients, setManagedClients } = useData();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    searchTerm: "",
    governorate: "",
    district: "",
    showDoneOnly: false,
    showPendingOnly: false,
  });

  useEffect(() => {
    fetchManagedClients();
  }, []);

  const fetchManagedClients = async () => {
    try {
      setLoading(true);
      const response = await managedAPI.getManagedClients();

      // Handle both response formats for backward compatibility
      const clientsData = response.clients || response.data?.clients || [];
      setManagedClients(clientsData);
    } catch (error) {
      console.error("Error fetching managed clients:", error);
      setError(error.message || "Failed to fetch clients");
      setManagedClients([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };
const toggleClientDone = async (clientId) => {
  const client = managedClients.find(c => c._id === clientId);
  
  try {
    const newStatus = !client.isDone;
    
    const response = await managedAPI.updateClientStatus(
      { 
        isDone: newStatus,
        clientId: client._id // Send client ID
      },
      { relationshipId: client.relationshipId }
    );

    // Update UI if successful
    setManagedClients(prev => 
      prev.map(c => c._id === clientId ? {...c, isDone: newStatus} : c)
    );
    
  } catch (error) {
    console.error("Update failed:", error);
    // Revert UI on error
    setManagedClients(prev => 
      prev.map(c => c._id === clientId ? {...c, isDone: !c.isDone} : c)
    );
  }
};
  const removeClientFromManaged = async (relationshipId) => {
    const client = managedClients.find(
      (c) => c.relationshipId === relationshipId
    );
    try {
      setError("");

      if (!client) {
        throw new Error("Client not found in managed list");
      }

      if (!client?.relationshipId) {
        throw new Error("Missing relationship data for this client");
      }
      console.log("Sent relation Id", client.relationshipId);
      console.log("[DEBUG] Attempting to remove client in the relationship:", {
        relationshipId: client.relationshipId,
        isValid: mongoose.Types.ObjectId.isValid(client.relationshipId),
      });

      const response = await managedAPI.removeClient(null, {
        id: client.relationshipId,
      });

      console.log("[DEBUG] Delete response:", response);

      if (!response.success) {
        throw new Error(
          response.message || "Deletion failed without error message"
        );
      }

      setManagedClients((prev) =>
        prev.filter((c) => c.relationshipId !== relationshipId)
      );
    } catch (error) {
      console.error("[ERROR] Failed to remove client:", {
        error: error.message,
        relationshipId: client?.relationshipId,
        fullError: error,
      });
      setError(error.message || "Failed to remove client");
    }
  };

  const updateFilters = (field, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "governorate") {
        updated.district = "";
      }

      if (field === "showDoneOnly" && value) {
        updated.showPendingOnly = false;
      }
      if (field === "showPendingOnly" && value) {
        updated.showDoneOnly = false;
      }

      return updated;
    });
  };

  const getFilteredClients = () => {
    let filtered = [...managedClients];

    if (filters.searchTerm) {
      filtered = filtered.filter((client) =>
        client.fullname.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.governorate) {
      filtered = filtered.filter(
        (client) => client.governorate === filters.governorate
      );
    }

    if (filters.district) {
      filtered = filtered.filter(
        (client) => client.district === filters.district
      );
    }

    if (filters.showDoneOnly) {
      filtered = filtered.filter((client) => client.isDone);
    }

    if (filters.showPendingOnly) {
      filtered = filtered.filter((client) => !client.isDone);
    }

    return filtered;
  };

  const filteredClients = getFilteredClients();
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
                <h2>📋 Manage Clients</h2>
                <p>Manage your current client list and track progress</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            {/* Search and Filter Section */}
            <div className="dashboard-item mb-4">
              <div className="dashboard-item-header">
                <h3>🔍 Search & Filter Clients</h3>
              </div>
              <div className="dashboard-item-content">
                <div className="dashboard-grid">
                  <div className="form-group">
                    <label>Search by Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search client name..."
                      value={filters.searchTerm}
                      onChange={(e) =>
                        updateFilters("searchTerm", e.target.value)
                      }
                    />
                  </div>

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
                    <label>Status Filter</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={filters.showDoneOnly}
                          onChange={(e) =>
                            updateFilters("showDoneOnly", e.target.checked)
                          }
                        />
                        Done Only
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={filters.showPendingOnly}
                          onChange={(e) =>
                            updateFilters("showPendingOnly", e.target.checked)
                          }
                        />
                        Pending Only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3>
                  Client List ({filteredClients.length} of{" "}
                  {managedClients.length} clients)
                </h3>
                <div className="flex gap-2">
                  <span className="badge badge-available">
                    ✓ Done: {managedClients.filter((c) => c.isDone).length}
                  </span>
                  <span className="badge badge-unavailable">
                    ⏳ Pending: {managedClients.filter((c) => !c.isDone).length}
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
              ) : managedClients.length === 0 ? (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <div className="mb-4">📋</div>
                    <p className="mb-4">No clients in your managed list yet</p>
                    <Link to="/browse-clients" className="btn btn-primary">
                      Browse Clients to Add
                    </Link>
                  </div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="dashboard-item">
                  <div className="dashboard-item-content text-center p-4">
                    <p>No clients match your current filters.</p>
                  </div>
                </div>
              ) : (
                <div className="dashboard-grid">
                  {filteredClients.map((client) => (
                    <div
                      key={client._id}
                      className={`dashboard-item ${
                        client.isDone ? "client-done" : ""
                      }`}
                    >
                      <div className="dashboard-item-header">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="flex items-center gap-2">
                              {client.fullname}
                              {client.isDone && (
                                <span className="text-green-600">✓</span>
                              )}
                            </h4>
                            <p>
                              {client.district}, {client.governorate}
                            </p>
                          </div>
                          <span
                            className={`badge ${
                              client.isDone
                                ? "badge-available"
                                : "badge-unavailable"
                            }`}
                          >
                            {client.isDone ? "Done" : "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="dashboard-item-content">
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            Added:{" "}
                            {new Date(client.dateAdded).toLocaleDateString()}
                          </p>
                          {client.neededSpecialists && (
                            <div className="mt-2">
                              <h6 className="text-sm font-medium mb-1">
                                Needed Services:
                              </h6>
                              <div className="flex flex-wrap gap-1">
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
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className={`btn ${
                              client.isDone ? "btn-secondary" : "btn-primary"
                            } flex-1`}
                            onClick={() => toggleClientDone(client._id)}
                          >
                            {client.isDone ? "Mark Pending" : "Mark Done"}
                          </button>
                          <button
                            className="btn btn-nav"
                            onClick={() => navigate(`/chat/${client.fullname}`)}
                          >
                            💬
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() =>
                              removeClientFromManaged(client.relationshipId)
                            }
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
  );
};

export default ManageClients;
