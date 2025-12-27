const getBackendOrigin = () => {
  // VITE_API_URL is typically like http://localhost:3000/api
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  try {
    const u = new URL(api)
    // remove any trailing /api path if present
    const origin = `${u.protocol}//${u.host}`
    return origin
  } catch (e) {
    return 'http://localhost:3000'
  }
}

export const resolveMediaUrl = (url) => {
  if (!url) return url
  if (url.startsWith('http') || url.startsWith('data:')) return url
  // If it's a relative upload path like '/uploads/xxx', serve from backend origin
  if (url.startsWith('/')) {
    const origin = getBackendOrigin()
    return `${origin}${url}`
  }
  return url
}

export default resolveMediaUrl
