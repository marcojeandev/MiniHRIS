import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  name: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      const { token, user } = response.data.data || response.data
      
      setToken(token)
      setUser(user)
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid credentials'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      const response = await authApi.logout()
      const message = response?.data?.message || 'Logged out successfully from all devices.'
      toast.success(message)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed. Please try again.')
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}