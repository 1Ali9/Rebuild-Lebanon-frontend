"use client"

import { createContext, useContext, useState } from "react"

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [managedClients, setManagedClients] = useState([])
  const [managedSpecialists, setManagedSpecialists] = useState([])
  const [conversations, setConversations] = useState([])

  const value = {
    managedClients,
    setManagedClients,
    managedSpecialists,
    setManagedSpecialists,
    conversations,
    setConversations,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
