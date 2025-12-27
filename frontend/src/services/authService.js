import api from './api.js'
import { demoUser, demoCredentials } from '../utils/demoData.js'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const authService = {
  signup: async (userData) => {
    if (DEMO) return { token: 'demo-token', user: { ...demoUser, ...userData } }
    const response = await api.post('/social/auth/signup', userData)
    return response.data
  },
  login: async (credentials) => {
    if (DEMO) {
      const useEmail = credentials.email || demoCredentials.email
      const usePhone = credentials.phone || demoCredentials.phone
      const usePassword = credentials.password || demoCredentials.password
      if ((useEmail || usePhone) && usePassword) return { token: 'demo-token', user: demoUser }
      return { error: 'Invalid demo credentials' }
    }
    const loginData = { identifier: credentials.email || credentials.phone, password: credentials.password }
    const response = await api.post('/social/auth/login', loginData)
    return response.data
  },
  sendOtp: async (phone) => {
    if (DEMO) return { success: true }
    const response = await api.post('/social/auth/otp/send', { phone })
    return response.data
  },
  verifyOtp: async (phone, code) => {
    if (DEMO) {
      if (code === demoCredentials.otpCode) return { token: 'demo-token', user: { ...demoUser, phone } }
      return { error: 'Invalid demo code' }
    }
    const response = await api.post('/social/auth/otp/verify', { phone, code })
    return response.data
  },
  googleLogin: async (idToken) => {
    if (DEMO) return { token: 'demo-token', user: demoUser }
    const response = await api.post('/social/auth/google', { idToken })
    return response.data
  },
  forgotPassword: async (email) => {
    if (DEMO) return { message: 'Reset email sent' }
    const response = await api.post('/social/auth/forgot-password', { email })
    return response.data
  },
  resetPassword: async (token, newPassword) => {
    if (DEMO) return { message: 'Password reset successful' }
    const response = await api.post('/social/auth/reset-password', { token, newPassword })
    return response.data
  },
  getCurrentUser: async () => {
    if (DEMO) return demoUser
    const response = await api.get('/social/auth/me')
    return response.data
  },
  updateProfile: async (userData) => {
    if (DEMO) return { success: true, user: { ...demoUser, ...userData } }
    const response = await api.patch('/social/auth/me', userData)
    return response.data
  }
}
