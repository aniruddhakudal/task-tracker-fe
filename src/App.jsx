import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading...</div>
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { pathname } = useLocation()
  const [showIntroVideo, setShowIntroVideo] = useState(false)

  useEffect(() => {
    if (pathname === '/login') {
      setShowIntroVideo(true)
    } else {
      setShowIntroVideo(false)
    }
  }, [pathname])

  return (
    <>
      {showIntroVideo && (
        <div
          onClick={() => setShowIntroVideo(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(96vw, 960px)',
              maxHeight: '96vh',
              background: '#111',
              borderRadius: 12,
              padding: 12,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button type="button" onClick={() => setShowIntroVideo(false)}>Close</button>
            </div>
            <video
              src="/mitu_birthday.mp4"
              controls
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxHeight: 'calc(96vh - 72px)',
                borderRadius: 8,
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
