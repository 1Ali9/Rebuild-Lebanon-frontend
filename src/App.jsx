"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { DataProvider } from "./contexts/DataContext"

// Import all components
import Welcome from "./components/Welcome"
import Login from "./components/Login"
import Registration from "./components/Registration"
import SpecialistSetup from "./components/SpecialistSetup"
import ClientDashboard from "./components/ClientDashboard"
import SpecialistDashboard from "./components/SpecialistDashboard"
import BrowseSpecialists from "./components/BrowseSpecialists"
import NeededSpecialists from "./components/NeededSpecialists"
import BrowseClients from "./components/BrowseClients"
import ManageClients from "./components/ManageClients"
import ManageSpecialists from "./components/ManageSpecialists"
import Conversations from "./components/Conversations"
import Chat from "./components/Chat"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "client" ? "/client-dashboard" : "/specialist-dashboard"} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/specialist-setup" element={<SpecialistSetup />} />

      {/* Protected Client Routes */}
      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse-specialists"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <BrowseSpecialists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/needed-specialists"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <NeededSpecialists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-specialists"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ManageSpecialists />
          </ProtectedRoute>
        }
      />

      {/* Protected Specialist Routes */}
      <Route
        path="/specialist-dashboard"
        element={
          <ProtectedRoute allowedRoles={["specialist"]}>
            <SpecialistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse-clients"
        element={
          <ProtectedRoute allowedRoles={["specialist"]}>
            <BrowseClients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-clients"
        element={
          <ProtectedRoute allowedRoles={["specialist"]}>
            <ManageClients />
          </ProtectedRoute>
        }
      />

      {/* Shared Protected Routes */}
      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:participantName"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="app-container">
          <AppRoutes />
        </div>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
