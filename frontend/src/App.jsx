"use client"

// src/App.jsx
import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useUserStore } from "./store/userStore"
import ResourceDetail from "./pages/ResourceDetail"

// Components
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Resources from "./pages/Resources"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import AIModule from "./pages/AIModule"
import { About } from "./pages/About"
import AuthPage from "./pages/AuthPage"
import MyResources from "./pages/MyResources";
import ComingSoon from "./components/ComingSoon";
import DSAPracticePage from "./pages/DSAPracticePage";

// A wrapper component to protect routes
const AuthRoute = ({ children }) => {
  const { user, isLoading } = useUserStore()

  // Show a loading spinner while the user data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to the auth page if no user is found
  return user ? children : <Navigate to="/auth" replace />
}

// A wrapper component to protect admin routes
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useUserStore()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to home if the user is not an admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

const AppLayout = () => {
  const { fetchUserProfile } = useUserStore()

  // Fetch the user profile on component mount to re-hydrate the state
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile()
    }
  }, [fetchUserProfile])

  return (
    <div className="min-h-screen bg-gray-800">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/resources"
            element={
              <AuthRoute>
                <Resources />
              </AuthRoute>
            }
          />
          <Route
            path="/resources/:id"
            element={
              <AuthRoute>
                <ResourceDetail />
              </AuthRoute>
            }
          />
          <Route
            path="/dsa-practice"
            element={
              <AuthRoute>
                <DSAPracticePage />
              </AuthRoute>
            }
          />
          <Route
            path="/ai-module"
            element={
              <AuthRoute>
                <AIModule />
              </AuthRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/about-us" element={<About />} />
          <Route path="/my-resources" element={<MyResources/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App
