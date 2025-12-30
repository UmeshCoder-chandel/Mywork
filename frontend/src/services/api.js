import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } })

// Track if we're already redirecting to prevent loops
let isRedirecting = false

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    // Only redirect if not already redirecting and not already on login page
    if (!isRedirecting && !window.location.pathname.includes('/login')) {
      isRedirecting = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Use replace to avoid adding to history
      window.location.replace('/login')
    }
  }
  return Promise.reject(error)
})

export default api

