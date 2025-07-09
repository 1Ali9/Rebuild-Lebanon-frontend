"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import { messagesAPI } from "../services/api"

const Conversations = () => {
  const { user } = useAuth()
  const { conversations, setConversations } = useData()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])


const fetchConversations = async () => {
  try {
    setLoading(true);
    const response = await messagesAPI.getConversations();
    
    // Handle standardized response
    setConversations(response.conversations || []);
    setError("");
  } catch (error) {
    setError(error.message || "Failed to fetch conversations");
    console.error("Error fetching conversations:", error);
    setConversations([]);
  } finally {
    setLoading(false);
  }
};

  const openConversation = (conversation) => {
    navigate(`/chat/${conversation.otherParticipant}`)
  }

  const getDashboardPath = () => {
    return user.role === "client" ? "/client-dashboard" : "/specialist-dashboard"
  }

  const getBrowsePath = () => {
    return user.role === "client" ? "/browse-specialists" : "/browse-clients"
  }

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Link to={getDashboardPath()} className="btn btn-nav">
                ← Back
              </Link>
              <div>
                <h2>💬 Messages</h2>
                <p>Your conversations with {user.role === "client" ? "specialists" : "clients"}</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="text-center p-4">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Loading...
                </div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`dashboard-item conversation-item ${conversation.unread ? "unread" : ""}`}
                    onClick={() => openConversation(conversation)}
                  >
                    <div className="dashboard-item-content">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{conversation.otherParticipant}</h4>
                            {conversation.unread && <span className="badge badge-available">New</span>}
                          </div>
                          <p className="conversation-preview">{conversation.lastMessage}</p>
                        </div>
                        <div className="conversation-time">
                          {new Date(conversation.timestamp).toLocaleDateString()}{" "}
                          {new Date(conversation.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-item">
                <div className="dashboard-item-content text-center p-4">
                  <div className="mb-4">💬</div>
                  <p className="mb-4">No conversations yet</p>
                  <Link to={getBrowsePath()} className="btn btn-primary">
                    Start a conversation
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Conversations
