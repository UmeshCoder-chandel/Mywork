import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { initSocket, getSocket, disconnectSocket } from '../utils/socket.js'
import { chatService } from '../services/chatService.js'
import { useAuth } from './AuthContext.jsx'
import { demoConversations, demoMessagesByConversation } from '../utils/demoData.js'

const ChatContext = createContext(null)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState({})
  const socketRef = useRef(null)
  const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

  useEffect(() => {
    if (!user) {
      disconnectSocket()
      setConversations([])
      setActiveConversation(null)
      return
    }
    if (DEMO) {
      setConversations(demoConversations)
      setMessages(demoMessagesByConversation)
      return () => {}
    }

    const token = localStorage.getItem('token')
    const socket = initSocket(token)
    socketRef.current = socket

    socket.connect()

    socket.on('connect', () => {
      socket.emit('join', { userId: user._id })
    })

    socket.on('message', (payload) => {
      const { conversationId, message } = payload
      setMessages((prev) => {
        const arr = prev[conversationId] ? [...prev[conversationId]] : []
        arr.push(message)
        return { ...prev, [conversationId]: arr }
      })
      setConversations((prev) => prev.map((c) => (c._id === conversationId ? { ...c, lastMessage: message } : c)))
    })

    socket.on('conversation-updated', (conv) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conv._id)
        if (!exists) return [conv, ...prev]
        return prev.map((c) => (c._id === conv._id ? conv : c))
      })
    })

    socket.on('typing', ({ conversationId, userId, typing }) => {
      setConversations((prev) => prev.map((c) => (c._id === conversationId ? { ...c, typing: typing ? userId : null } : c)))
    })

    ;(async () => {
      try {
        const data = await chatService.getConversations()
        setConversations(data.conversations || data || [])
      } catch (_) {}
    })()

    return () => {
      if (socket) {
        socket.off('connect')
        socket.off('message')
        socket.off('conversation-updated')
        socket.off('typing')
        disconnectSocket()
      }
    }
  }, [user])

  const openConversation = async (conversationIdOrUserId) => {
    try {
      if (!conversationIdOrUserId) return
      let convId = conversationIdOrUserId
      const isConversationId = String(conversationIdOrUserId).length === 24 && conversations.some(c => c._id === conversationIdOrUserId)
      if (!isConversationId) {
        if (DEMO) {
          const found = demoConversations[0]
          convId = found._id
          setConversations(prev => prev)
        } else {
        const data = await chatService.createConversation(conversationIdOrUserId)
        const conv = data.conversation || data
        convId = conv._id
        setConversations(prev => {
          const exists = prev.some(c => c._id === convId)
          if (exists) return prev
          return [conv, ...prev]
        })
        }
      }
      setActiveConversation(convId)
      if (DEMO) {
        setMessages((prev) => ({ ...prev, [convId]: demoMessagesByConversation[convId] || [] }))
      } else {
        const data2 = await chatService.getMessages(convId)
        setMessages((prev) => ({ ...prev, [convId]: data2.messages || data2 || [] }))
      }
    } catch (_) {}
  }

  const sendMessage = async (conversationId, text, media) => {
    try {
      const newMessage = { _id: `temp-${Date.now()}`, text, user: user._id, createdAt: new Date().toISOString() }
      setMessages((prev) => {
        const arr = prev[conversationId] ? [...prev[conversationId]] : []
        arr.push(newMessage)
        return { ...prev, [conversationId]: arr }
      })
      if (DEMO) {
        return newMessage
      }
      const socket = getSocket()
      if (socket && socket.connected) socket.emit('message', { conversationId, message: { text } })
      const data = await chatService.sendMessage(conversationId, { text, media })
      const savedMessage = data.message || data
      setMessages((prev) => {
        const arr = prev[conversationId] ? [...prev[conversationId]] : []
        const replaced = arr.map((m) => (m._id === newMessage._id ? savedMessage : m))
        return { ...prev, [conversationId]: replaced }
      })
      return savedMessage
    } catch (err) {
      throw err
    }
  }

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    openConversation,
    messages,
    sendMessage,
    socketRef
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export default ChatContext
