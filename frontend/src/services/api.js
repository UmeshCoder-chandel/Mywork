import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')

const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } })

let isRedirecting = false
const __cache = new Map()
const __inFlight = new Map()
const DEFAULT_TTL = Number(import.meta.env.VITE_CACHE_TTL || 30000)

const __key = (url, params) => {
  try {
    return `${url}?${params ? JSON.stringify(params) : ''}`
  } catch {
    return url
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    if (!isRedirecting && !window.location.pathname.includes('/login')) {
      isRedirecting = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
  }
  return Promise.reject(error)
})

const __origGet = api.get.bind(api)
api.get = async (url, config = {}) => {
  const key = __key(url, config.params)
  const now = Date.now()
  const cached = __cache.get(key)
  const ttl = Number(config.ttl || DEFAULT_TTL)

  if (cached && now - cached.ts < ttl) {
    return Promise.resolve({ data: cached.data })
  }
  if (__inFlight.has(key)) {
    return __inFlight.get(key)
  }
  const reqPromise = __origGet(url, config)
    .then((res) => {
      __cache.set(key, { data: res.data, ts: Date.now() })
      __inFlight.delete(key)
      return res
    })
    .catch((err) => {
      __inFlight.delete(key)
      throw err
    })
  __inFlight.set(key, reqPromise)
  if (cached) {
    return Promise.resolve({ data: cached.data })
  }
  return reqPromise
}

export default api
