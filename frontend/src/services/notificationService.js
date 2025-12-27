import api from './api.js'

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/social/notifications')
    return response.data
  },
  markAsRead: async (notificationId) => {
    const response = await api.post(`/social/notifications/read`)
    return response.data
  },
  markAllRead: async () => {
    const response = await api.post('/social/notifications/read')
    return response.data
  }
}

export default notificationService
