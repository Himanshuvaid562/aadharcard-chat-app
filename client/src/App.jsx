import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'

function Protected({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"/></div>
  if (!token) return <Navigate to="/login" replace />
  return children
}
function PublicOnly({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (token) return <Navigate to="/chat" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<PublicOnly><Login/></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register/></PublicOnly>} />
      <Route path="/chat" element={<Protected><Chat/></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
