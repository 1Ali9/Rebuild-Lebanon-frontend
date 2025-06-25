"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import { messagesAPI, managedAPI } from "../services/api"

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

  useEffect(() => {
    if (participantName) {
      initializeChat()
    }
  }, [participantName])

  const initializeChat = async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.createConversation(participantName)
      setConversationId(response.data.conversationId)
      setMessages(response.data.messages || [])
    } catch (error) {
      setError("Failed to initialize chat")
      console.error("Error initializing chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setLoading(true)
      const response = await messagesAPI.sendMessage({
        recipientName: participantName,
        message: newMessage,
        conversationId,
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
        // Add specialist to managed list
        await managedAPI.addSpecialist(participantName)
        // You would need to fetch the specialist details here
        // For now, we'll create a mock entry
        const newManagedSpecialist = {
          _id: Date.now().toString(),
          fullname: participantName,
          governorate: "Unknown",
          district: "Unknown",
          specialty: "Unknown",
          isDone: false,
          dateAdded: new Date(),
          isAvailable: true,
        }
        setManagedSpecialists((prev) => [...prev, newManagedSpecialist])
      } else {
        // Add client to managed list
        await managedAPI.addClient(participantName)
        const newManagedClient = {
          _id: Date.now().toString(),
          fullname: participantName,
          governorate: "Unknown",
          district: "Unknown",
          isDone: false,
          dateAdded: new Date(),
        }
        setManagedClients((prev) => [...prev, newManagedClient])
      }
    } catch (error) {
      setError("Failed to add to managed list")
      console.error("Error adding to managed list:", error)
    }
  }

  const isInManagedList = () => {
    if (user.role === "client") {
      return managedSpecialists.some((ms) => ms.fullname === participantName)
    } else {
      return managedClients.some((mc) => mc.fullname === participantName)
    }
  }

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
