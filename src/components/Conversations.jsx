"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { messagesAPI } from "../services/api";

const Conversations = () => {
  const { user } = useAuth();
  const { conversations, setConversations } = useData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await messagesAPI.getConversations();

      // Handle different response structures
      const rawConversations = Array.isArray(response)
        ? response
        : response?.conversations
        ? response.conversations
        : response?.data
        ? response.data
        : [];

      // Transform messages into conversation objects with null checks
      const conversationsWithParticipants = rawConversations.map(
        (conversation) => {
          // Safe access to properties
          const lastMessage = conversation.lastMessage || {};
          const participants = conversation.participants || [];

          // Find other participant (not current user)
          const otherParticipant = participants.find(
            (p) => p._id !== user.id && p.toString() !== user.id
          );

          return {
            ...conversation,
            otherParticipantId: otherParticipant?._id || otherParticipant,
            otherParticipantName: otherParticipant?.fullname || "Unknown",
            lastMessageText: lastMessage.message || "",
            timestamp:
              lastMessage.createdAt || conversation.updatedAt || new Date(),
            unread: conversation.unreadCount > 0,
          };
        }
      );
      conversationsWithParticipants.map((conv) => console.log(conv));
      // Sort by most recent message first
      conversationsWithParticipants.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setConversations(conversationsWithParticipants);
    } catch (error) {
      setError(error.message || "Failed to fetch conversations");
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conversation) => {
    console.log("Conversation ID to be sent: ", conversation?.id);
    navigate(`/chat/${conversation?.otherParticipantName}`, {
      state: {
        conversationId: conversation?.id,
        participantName: conversation?.otherParticipantName,
        participantId: conversation?.otherParticipantId,
      },
    });
  };

  const getDashboardPath = () => {
    return user.role === "client"
      ? "/client-dashboard"
      : "/specialist-dashboard";
  };

  const getBrowsePath = () => {
    return user.role === "client" ? "/browse-specialists" : "/browse-clients";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

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
                <p>
                  Your conversations with{" "}
                  {user.role === "client" ? "specialists" : "clients"}
                </p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && (
              <div className="error-message mb-4">
                {error}
                <button
                  onClick={fetchConversations}
                  className="btn btn-sm ml-2"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center p-4">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Loading conversations...
                </div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id || conversation.id}
                    className={`dashboard-item conversation-item ${
                      conversation.unread ? "unread" : ""
                    } hover:bg-gray-50 cursor-pointer`}
                    onClick={() => openConversation(conversation)}
                  >
                    <div className="dashboard-item-content">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {conversation?.otherParticipantName}
                            </h4>
                            {conversation.unread && (
                              <span className="badge badge-available">New</span>
                            )}
                          </div>
                          <p className="conversation-preview text-gray-600 truncate">
                            {conversation.lastMessageText}
                          </p>
                        </div>
                        <div className="conversation-time text-sm text-gray-500 whitespace-nowrap ml-2">
                          {formatDate(conversation.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-item">
                <div className="dashboard-item-content text-center p-4">
                  <div className="mb-4 text-4xl">💬</div>
                  <p className="mb-4 text-gray-600">No conversations yet</p>
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
  );
};

export default Conversations;
