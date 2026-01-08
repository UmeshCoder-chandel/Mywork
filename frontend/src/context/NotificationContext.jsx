import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { initSocket, disconnectSocket } from '../utils/socket.js'
import { notificationService } from '../services/notificationService.js'
import { useAuth } from './AuthContext.jsx'
import { demoNotifications } from '../utils/demoData.js'

const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const socketRef = useRef(null)
  const loadedUserIdRef = useRef(null)
  const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

  useEffect(() => {
    if (!user) {
      disconnectSocket()
      setNotifications([])
      loadedUserIdRef.current = null
      return
    }

    // If notifications already loaded for this user, skip fetching
    if (loadedUserIdRef.current === user._id) {
      // Ensure socket is connected if it exists
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect()
      }
      return
    }

    if (DEMO) {
      setNotifications(demoNotifications)
      loadedUserIdRef.current = user._id
      return () => {}
    }
    const token = localStorage.getItem('token')
    const socket = initSocket(token)
    socketRef.current = socket
    socket.connect()
    socket.on('notification', (payload) => setNotifications((prev) => [payload, ...prev]))
    ;(async () => {
      try {
        const data = await notificationService.getNotifications()
        setNotifications(data.notifications || data || [])
        loadedUserIdRef.current = user._id
      } catch (_) {
        loadedUserIdRef.current = user._id
      }
    })()
    return () => {
      if (socket) {
        socket.off('notification')
        disconnectSocket()
      }
    }
  }, [user])

  const markAsRead = async (id) => {
    try {
      if (DEMO) {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
        return
      }
      await notificationService.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch (_) {}
  }

  const markAllRead = async () => {
    try {
      if (DEMO) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        return
      }
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (_) {}
  }

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value = { notifications, unreadCount, markAsRead, markAllRead }
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export default NotificationContext
