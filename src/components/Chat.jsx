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
      
      // Case 1: We already have a conversation ID - just load messages
      if (conversationId) {
        const messagesResponse = await messagesAPI.getMessages(null, {
          conversationId: conversationId,
        });
        setMessages(messagesResponse?.messages || []);
        setConversation(conversationId);
        return;
      }
      
      // Case 2: No conversation but we have participant info - check if conversation exists
      if (participantId && user?._id) {
        // First try to find existing conversation
        const existingConvos = await messagesAPI.getConversations();
        const existingConvo = existingConvos.find(conv => 
          conv.participants.some(p => p._id === participantId)
        );
        
        if (existingConvo) {
          // Use existing conversation
          setConversation(existingConvo._id);
          navigate(location.pathname, {
            state: {
              ...state,
              conversationId: existingConvo._id,
            },
            replace: true,
          });
          const messagesResponse = await messagesAPI.getMessages(null, {
            conversationId: existingConvo._id,
          });
          setMessages(messagesResponse?.messages || []);
          return;
        }
        
        // No existing conversation - don't create yet (wait for first message)
        setConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  initializeChat();
}, [conversationId, participantId, user?._id]);
  



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
  if (!conversation && !participantId) return;

  const pollMessages = async () => {
    try {
      // If we have a conversation, poll for its messages
      if (conversation) {
        const messagesResponse = await messagesAPI.getMessages(null, {
          conversationId: conversation,
        });
        setMessages(messagesResponse?.messages || []);
      }
      // If we don't have conversation but have participant, we could check for new conversations
      // This is optional based on your requirements
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  // Poll immediately
  pollMessages();
  
  // Then set up interval
  const pollInterval = setInterval(pollMessages, 3000);
  return () => clearInterval(pollInterval);
}, [conversation, participantId]); // Add participantId to dependencies

const sendMessage = async () => {
  if (!newMessage.trim()) return;

  try {
    setLoading(true);
    let convoId = conversation;

    // If no conversation exists, create one first
    if (!convoId && participantId && user?._id) {
      const createResponse = await messagesAPI.createConversation({
        participantId,
        currentUserId: user._id,
      });

      if (!createResponse.conversationId) {
        throw new Error("Failed to create conversation");
      }

      convoId = createResponse.conversationId;
      
      // Immediately update state with the new conversation
      setConversation(convoId);
      
      // Update route state to persist the conversation ID
      navigate(location.pathname, {
        state: {
          ...state,
          conversationId: convoId,
        },
        replace: true,
      });

      // Return early to let the polling effect handle the messages
      // This ensures we don't try to send before the conversation is ready
      setNewMessage("");
      return;
    }

    // Now send the message to the existing conversation
    const messageResponse = await messagesAPI.sendMessage({
      conversationId: convoId,
      message: newMessage,
      recipientId: participantId,
    });

    // Optimistically update the UI
    setMessages(prev => [...prev, {
      _id: Date.now().toString(), // temporary ID
      message: newMessage,
      sender: { _id: user._id },
      createdAt: new Date().toISOString(),
    }]);
    
    setNewMessage("");

  } catch (error) {
    setError("Failed to send message");
    console.error("Error sending message:", error);
  } finally {
    setLoading(false);
  }
};

// Modified polling effect
useEffect(() => {
  if (!conversation) return;

  const pollMessages = async () => {
    try {
      const messagesResponse = await messagesAPI.getMessages(null, {
        conversationId: conversation,
      });
      setMessages(messagesResponse?.messages || []);
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  // Poll immediately when conversation is set
  pollMessages();
  
  // Then set up interval polling
  const pollInterval = setInterval(pollMessages, 3000);

  return () => clearInterval(pollInterval);
}, [conversation]);



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
    return managedSpecialists.some((ms) => ms?._id === participantId);
  } else {
    return managedClients.some((mc) => mc?._id === participantId);
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
