"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { messagesAPI, managedAPI, usersAPI } from "../services/api";

const Chat = () => {
  const { user } = useAuth();
  const {
    managedSpecialists,
    setManagedSpecialists,
    managedClients,
    setManagedClients,
  } = useData();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState(null);

  const { state } = useLocation();
  const {
    conversationId = null,
    participantName = "",
    participantId = null,
  } = state || {};
  managedSpecialists?.map((ms) => console.log(ms));
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        setError("");
        setConversation(conversationId);
        // Get both user IDs from state
        const { participantId, currentUserId } = state || {};

        if (participantId && currentUserId && !conversation) {
          console.log(
            "Creating conversation between:",
            currentUserId,
            "and",
            participantId
          );

          const response = await messagesAPI.createConversation({
            participantId,
            currentUserId,
          });

          if (!response.conversationId) {
            throw new Error("Failed to create conversation");
          }

          navigate(location.pathname, {
            state: {
              ...state,
              conversationId: response.conversationId,
            },
            replace: true,
          });

          const messagesResponse = await messagesAPI.getMessages(null, {
            conversationId: response.conversationId,
          });
          setMessages(messagesResponse?.messages || []);
          return;
        }

        if (conversation) {
          // Mark messages as read when entering the conversation
          await messagesAPI.markConversationAsRead(null, {
            conversationId: conversation,
          });
          const messagesResponse = await messagesAPI.getMessages(null, {
            conversationId: conversation,
          });
          setMessages(messagesResponse?.messages || []);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(error.message);
        navigate("/conversations");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [
    conversation,
    participantId,
    state?.currentUserId,
    managedSpecialists,
    managedClients,
  ]); // Add currentUserId to dependencies
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!conversation || !user?._id) return;

      try {
        // Call the markAsRead endpoint
        await messagesAPI.markConversationAsRead({
          conversationId: conversation,
          userId: user._id,
        });

        // Optionally refresh conversations list
        // This would depend on your state management
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markMessagesAsRead();
  }, [conversation, user?._id]);
  useEffect(() => {
    if (!conversation) return;

    const pollInterval = setInterval(async () => {
      try {
        const messagesResponse = await messagesAPI.getMessages(null, {
          conversationId: conversation,
        });
        setMessages(messagesResponse?.messages || []);
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(pollInterval);
  }, [conversation]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setLoading(true);
      const response = await messagesAPI.sendMessage({
        conversationId: conversation,
        message: newMessage,
        recipientId: participantId,
      });
      setConversation(response?.data?.conversationId);
      console.log("holding convo id: ", conversation);
      setMessages((prev) => [...prev, response?.data?.message]);
      setNewMessage("");
    } catch (error) {
      setError("Failed to send message");
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addToManagedList = async () => {
    try {
      if (user.role === "client") {
        // Change from participantName to participantId
        console.log("specislist id (frontend): ", participantId);
        const response = await managedAPI.addSpecialist({
          specialistId: participantId,
        });
        setManagedSpecialists((prev) => [...prev, response?.data?.specialist]);
      } else {
        // Change from participantName to participantId
        const response = await managedAPI.addClient(participantId);
        setManagedClients((prev) => [...prev, response?.data?.client]);
      }
    } catch (error) {
      setError("Failed to add to managed list");
      console.error("Error adding to managed list:", error);
    }
  };

  const isInManagedList = () => {
    if (user.role === "client") {
      return managedSpecialists.some((ms) => ms?.fullname === participantName);
    } else {
      return managedClients.some((mc) => mc?.fullname === participantName);
    }
  };

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="chat-container">
          <div className="chat-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/conversations" className="btn btn-nav">
                  ← Back
                </Link>
                <div>
                  <h2>💬 Chat with {participantName}</h2>
                  <p>Direct message conversation</p>
                </div>
              </div>
              {!isInManagedList() && (
                <button className="btn btn-black" onClick={addToManagedList}>
                  + Add to {user.role === "client" ? "Specialist" : "Client"}{" "}
                  List
                </button>
              )}
            </div>
          </div>
          <div className="chat-content">
            {error && <div className="error-message">{error}</div>}
            <div className="chat-messages">
              {Array.isArray(messages) ? (
                messages.map((message) =>
                  message ? (
                    <div
                      key={message._id}
                      className={`message ${
                        message.sender._id !== participantId
                          ? "message-sent"
                          : "message-received"
                      }`}
                    >
                      <div className="message-content">
                        <p>{message.message}</p>
                        <span className="message-time">
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleString([], {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  ) : null
                )
              ) : (
                <p>No messages to display</p>
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                className="form-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
