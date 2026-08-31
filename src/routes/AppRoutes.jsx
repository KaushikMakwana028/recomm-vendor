import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import MyStore from '../pages/MyStore'
import Products from '../pages/Products'
import Orders from '../pages/Orders'
import Inventory from '../pages/Inventory'
import Customers from '../pages/Customers'
import Offers from '../pages/Offers'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'

/* ── Full-page loader (only shown during boot checkAuth) ── */
const FullPageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    fontFamily: 'Poppins, sans-serif',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #e5e7eb',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
      }} />
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
        Loading…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
)

/* ── Protected Route ── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

/* ── Public Route ── */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const location = useLocation()
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }
  return children
}

const AppRoutes = () => {
  // ✅ Use authChecked (boot check only) — NOT loading.
  // loading is true during OTP API calls which would unmount the Login form
  // and reset its local `step` state back to 1, causing the redirect bug.
  const { authChecked } = useSelector((s) => s.auth)

  if (!authChecked) return <FullPageLoader />

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/store" element={<ProtectedRoute><MyStore /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes