import api from './api.js'

export const postService = {
  getAllPosts: async () => {
    const response = await api.get('/social/posts/feed')
    return response.data
  },
  getPostsByUser: async (userId) => {
    const response = await api.get(`/social/posts/user/${userId}`)
    return response.data
  },
  createPost: async (postData) => {
    const formData = new FormData()
    formData.append('description', postData.description)
    // Accept mediaFiles (array of File) or legacy images/video
    if (postData.mediaFiles && postData.mediaFiles.length) {
      postData.mediaFiles.forEach((f) => formData.append('media', f))
    } else {
      if (postData.images && postData.images.length > 0) postData.images.forEach((f) => formData.append('media', f))
      if (postData.video) formData.append('media', postData.video)
    }
    const response = await api.post('/social/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },

  likePost: async (postId) => {
    const response = await api.post(`/social/posts/${postId}/like`)
    return response.data
  },
  commentPost: async (postId, commentText) => {
    const response = await api.post(`/social/posts/${postId}/comments`, { text: commentText })
    return response.data
  },
  getComments: async (postId) => {
    const response = await api.get(`/social/posts/${postId}/comments`)
    return response.data
  },
  getReels: async (page = 1) => {
    const response = await api.get('/social/posts/reels', { params: { page } })
    return response.data
  },
  searchPosts: async (query) => {
    const response = await api.get('/social/posts/search', { params: { q: query } })
    return response.data
  }
}

