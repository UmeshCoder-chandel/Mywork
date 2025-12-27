import api from './api.js'

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/social/chat/conversations')
    return response.data
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/social/chat/conversations/${conversationId}/messages`)
    return response.data
  },
  sendMessage: async (conversationId, payload) => {
    const body = { text: payload.text }
    const response = await api.post(`/social/chat/conversations/${conversationId}/messages`, body)
    return response.data
  },
  createConversation: async (otherUserId) => {
    const response = await api.post('/social/chat/conversations', { userId: otherUserId })
    return response.data
  }
}

export default chatService
