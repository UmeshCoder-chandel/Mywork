import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        authService.getCurrentUser()
          .then((data) => {
            const userData = data.user || data
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          })
          .catch(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch (_) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials)
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: 'No token received' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const signup = async (userData) => {
    try {
      const data = await authService.signup(userData)
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: 'No token received' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

