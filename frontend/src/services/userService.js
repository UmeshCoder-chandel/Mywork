import api from './api.js'

export const userService = {
  searchUsers: async (query) => {
    const response = await api.get('/social/users/search', { params: { q: query } })
    return response.data
  },
  getUserById: async (id) => {
    const response = await api.get(`/social/users/${id}`)
    return response.data
  },
  uploadProfileImage: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/social/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },
  followUser: async (id) => {
    const response = await api.post(`/social/users/${id}/follow`)
    return response.data
  },
  unfollowUser: async (id) => {
    const response = await api.delete(`/social/users/${id}/follow`)
    return response.data
  },
  getFollowers: async (id) => {
    const response = await api.get(`/social/users/${id}/followers`)
    return response.data
  },
  getFollowing: async (id) => {
    const response = await api.get(`/social/users/${id}/following`)
    return response.data
  },
  getSuggestions: async () => {
    const response = await api.get('/social/users/suggestions')
    return response.data
  }
}

export default userService
