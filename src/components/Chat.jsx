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
  const [participant, setParticipant] = useState(null);

  const { state } = useLocation();
  const { conversationId, participantName, participantId } = state;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        setError("");
        console.log(state);
        if (conversationId) {
          console.log(conversationId, participantId, participantName);
          const messagesResponse = await messagesAPI.getMessages(null, {
            conversationId: conversationId,
          });
          console.log(messagesResponse?.messages);
          setMessages(messagesResponse?.messages || []);
        } else {
          const userResponse = await usersAPI.getSpecialists({
            fullname: participantName,
          });
          const participants = userResponse.data?.specialists || [];
          if (participants.length === 0)
            throw new Error("Participant not found");
          const foundParticipant = participants[0];
          setParticipant(foundParticipant);

          const response = await messagesAPI.createConversation({
            participantId: foundParticipant._id,
          });

          if (!response.conversationId) {
            throw new Error("Failed to create conversation");
          }

          const messagesResponse = await messagesAPI.getMessages(null, {
            conversationId: conversationId,
          });
          console.log(messagesResponse);
          setMessages(messagesResponse.messages || []);
        }
      } catch (error) {
        setError(error.message || "Error initializing chat");
        navigate("/conversations");
      } finally {
        setLoading(false);
      }
    };
    if (participantId) {
      // Fetch participant name by ID
      const fetchName = async () => {
        const userResponse = await usersAPI.getUserById(null, {
          id: participantId,
        });
        setParticipant(userResponse?.fullname);
      };
      fetchName();
      initializeChat();
    }
  }, [participantId]);
useEffect(() => {
  if (!conversationId) return;

  const pollInterval = setInterval(async () => {
    try {
      const messagesResponse = await messagesAPI.getMessages(null, {
        conversationId: conversationId,
      });
      setMessages(messagesResponse?.messages || []);
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  }, 2000); // Check every 3 seconds

  return () => clearInterval(pollInterval);
}, [conversationId]);
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setLoading(true);
      const response = await messagesAPI.sendMessage({
        conversationId,
        message: newMessage,
      });
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
        const response = await managedAPI.addSpecialist(participantName);
        setManagedSpecialists((prev) => [...prev, response.data.specialist]);
      } else {
        const response = await managedAPI.addClient(participantName);
        setManagedClients((prev) => [...prev, response.data.client]);
      }
    } catch (error) {
      setError("Failed to add to managed list");
      console.error("Error adding to managed list:", error);
    }
  };

  const isInManagedList = () => {
    if (user.role === "client") {
      return managedSpecialists.some((ms) => ms.fullname === participantName);
    } else {
      return managedClients.some((mc) => mc.fullname === participantName);
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
                          {new Date(message.timestamp).toLocaleTimeString()}
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
