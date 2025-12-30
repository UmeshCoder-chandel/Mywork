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
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (!token) {
        // No token, clear everything and stop loading
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
        return
      }

      if (token && savedUser) {
        try {
          // Set user from localStorage first for immediate UI update
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          
          // Then verify with server
          try {
            const data = await authService.getCurrentUser()
            const userData = data.user || data
            if (userData) {
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
            }
          } catch (error) {
            // Token is invalid, clear everything
            console.log('Token invalid, clearing auth')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (parseError) {
          // Invalid saved user data, clear everything
          console.log('Invalid saved user data, clearing auth')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } else if (token && !savedUser) {
        // Have token but no saved user, try to fetch user
        try {
          const data = await authService.getCurrentUser()
          const userData = data.user || data
          if (userData) {
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } else {
            localStorage.removeItem('token')
            setUser(null)
          }
        } catch (error) {
          localStorage.removeItem('token')
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    checkAuth()
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
      if (data.message) {
        // Email verification flow: signup succeeded but requires email verification
        return { success: true, needsEmailVerification: true, message: data.message }
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
    // Navigate to login page after logout
    window.location.href = '/login'
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

