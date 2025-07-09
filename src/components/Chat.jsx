"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import { messagesAPI, managedAPI, usersAPI } from "../services/api"

const Chat = () => {
  const { participantName } = useParams()
  const { user } = useAuth()
  const { managedSpecialists, setManagedSpecialists, managedClients, setManagedClients } = useData()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [conversationId, setConversationId] = useState(null)
  const [participant, setParticipant] = useState(null)

  useEffect(() => {
    if (participantName) {
      initializeChat()
    }
  }, [participantName])

const initializeChat = async () => {
  try {
    setLoading(true);
    setError("");
    
    // Get participant data
    const userResponse = user.role === "client" 
      ? await usersAPI.getSpecialists({ fullname: participantName })
      : await usersAPI.getClients({ fullname: participantName });
    
    const participants = userResponse.data?.specialists || userResponse.data?.clients || [];
    
    if (participants.length === 0) {
      throw new Error("Participant not found");
    }
    
    const foundParticipant = participants[0];
    setParticipant(foundParticipant);
    
    // Only send participantId - backend will get current user from auth
    const response = await messagesAPI.createConversation({
      participantId: foundParticipant._id
    });
    
    if (!response.conversationId) {
      throw new Error("Failed to create conversation");
    }
    
    setConversationId(response.conversationId);
    setMessages(response.messages || []);
  } catch (error) {
    setError(error.message || "Failed to initialize chat");
    console.error("Error initializing chat:", error);
    navigate("/conversations");
  } finally {
    setLoading(false);
  }
};
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      setLoading(true)
      const response = await messagesAPI.sendMessage({
        conversationId,
        message: newMessage
      })
      setMessages((prev) => [...prev, response.data.message])
      setNewMessage("")
    } catch (error) {
      setError("Failed to send message")
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addToManagedList = async () => {
    try {
      if (user.role === "client") {
        const response = await managedAPI.addSpecialist(participantName)
        setManagedSpecialists((prev) => [...prev, response.data.specialist])
      } else {
        const response = await managedAPI.addClient(participantName)
        setManagedClients((prev) => [...prev, response.data.client])
      }
    } catch (error) {
      setError("Failed to add to managed list")
      console.error("Error adding to managed list:", error)
    }
  }

const isInManagedList = () => {
  if (user.role === "client") {
    return managedSpecialists.some((ms) => ms.fullname === participantName);
  } else {
    return managedClients.some((mc) => mc.fullname === participantName); // Fixed 'ms' to 'mc'
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
                  + Add to {user.role === "client" ? "Specialist" : "Client"} List
                </button>
              )}
            </div>
          </div>
          <div className="chat-content">
            {error && <div className="error-message">{error}</div>}
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${message.sender === user.fullname ? "message-sent" : "message-received"}`}
                >
                  <div className="message-content">
                    <p>{message.message}</p>
                    <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
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
              <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat