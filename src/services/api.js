// Mock API service for development
// Replace with real axios calls when backend is ready

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock data
const mockSpecialists = [
  {
    _id: "1",
    fullname: "Ahmad Khalil",
    role: "specialist",
    governorate: "Beirut",
    district: "Beirut",
    specialty: "Civil Engineer",
    isAvailable: true,
  },
  {
    _id: "2",
    fullname: "Fatima Mansour",
    role: "specialist",
    governorate: "Mount Lebanon",
    district: "Baabda",
    specialty: "Architect",
    isAvailable: true,
  },
]

const mockClients = [
  {
    _id: "3",
    fullname: "Omar Fares",
    role: "client",
    governorate: "Beirut",
    district: "Beirut",
    neededSpecialists: [
      { name: "Civil Engineer", isNeeded: true },
      { name: "Architect", isNeeded: true },
    ],
  },
]

// Auth API
export const authAPI = {
  login: async (credentials) => {
    await delay(500)
    return {
      data: {
        token: "mock-token",
        user: {
          _id: "user123",
          fullname: credentials.fullname,
          role: credentials.fullname.toLowerCase().includes("specialist") ? "specialist" : "client",
          governorate: "Beirut",
          district: "Beirut",
        },
      },
    }
  },
  register: async (userData) => {
    await delay(500)
    return {
      data: {
        token: "mock-token",
        user: { _id: "user123", ...userData },
      },
    }
  },
  logout: async () => {
    await delay(200)
    return { data: { success: true } }
  },
  verifyToken: async () => {
    await delay(200)
    return {
      data: {
        user: {
          _id: "user123",
          fullname: "Demo User",
          role: "client",
        },
      },
    }
  },
}

// Users API
export const usersAPI = {
  getSpecialists: async (filters) => {
    await delay(500)
    return { data: { specialists: mockSpecialists } }
  },
  getClients: async (filters) => {
    await delay(500)
    return { data: { clients: mockClients } }
  },
  updateNeededSpecialists: async (specialists) => {
    await delay(300)
    return { data: { success: true } }
  },
  updateAvailability: async (isAvailable) => {
    await delay(300)
    return { data: { success: true } }
  },
}

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    await delay(500)
    return { data: { conversations: [] } }
  },
  getMessages: async (conversationId) => {
    await delay(500)
    return { data: { messages: [] } }
  },
  sendMessage: async (data) => {
    await delay(300)
    return {
      data: {
        message: {
          _id: Date.now().toString(),
          sender: "Current User",
          message: data.message,
          timestamp: new Date(),
        },
      },
    }
  },
  createConversation: async (participantName) => {
    await delay(300)
    return {
      data: {
        conversationId: "conv123",
        messages: [],
      },
    }
  },
}

// Managed Lists API
export const managedAPI = {
  addClient: async (clientId) => {
    await delay(300)
    return { data: { success: true } }
  },
  removeClient: async (clientId) => {
    await delay(300)
    return { data: { success: true } }
  },
  updateClientStatus: async (clientId, isDone) => {
    await delay(300)
    return { data: { success: true } }
  },
  getManagedClients: async () => {
    await delay(500)
    return { data: { clients: [] } }
  },
  addSpecialist: async (specialistId) => {
    await delay(300)
    return { data: { success: true } }
  },
  removeSpecialist: async (specialistId) => {
    await delay(300)
    return { data: { success: true } }
  },
  updateSpecialistStatus: async (specialistId, isDone) => {
    await delay(300)
    return { data: { success: true } }
  },
  getManagedSpecialists: async () => {
    await delay(500)
    return { data: { specialists: [] } }
  },
}

export default {
  authAPI,
  usersAPI,
  messagesAPI,
  managedAPI,
}
