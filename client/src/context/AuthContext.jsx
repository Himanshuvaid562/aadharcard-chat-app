import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => {
      localStorage.removeItem('token'); setToken(null); setUser(null)
    }).finally(() => setLoading(false))
  }, [token])

  const login = async (aadhaar, password) => {
    const { data } = await api.post('/auth/login', { aadhaar, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, aadhaar, password) => {
    const { data } = await api.post('/auth/register', { name, aadhaar, password })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null); setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>
}
