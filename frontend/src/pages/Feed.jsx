import { useState, useEffect } from 'react'
import { postService } from '../services/postService.js'
import PostCard from '../components/PostCard.jsx'
import { demoPosts } from '../utils/demoData.js'
import { FiRefreshCw } from 'react-icons/fi'
import userService from '../services/userService.js'
import { useAuth } from '../context/AuthContext.jsx'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const { user } = useAuth()

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setPosts(demoPosts)
      } else {
        const data = await postService.getAllPosts()
        setPosts(data.posts || data || [])
      }
      setError('')
    } catch (_) {
      setPosts(demoPosts)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        // demo users from demoData (already included in build)
        setSuggestions([])
      } else {
        const data = await userService.getSuggestions()
        setSuggestions(data.suggestions || [])
      }
    } catch (_) {
      setSuggestions([])
    }
  }

  // Re-fetch suggestions when posts are empty or on mount
  useEffect(() => { if (!loading && posts.length === 0) fetchSuggestions() }, [loading, posts.length])

  const handleFollow = async (id) => {
    try {
      await userService.followUser(id)
      setSuggestions(prev => prev.filter(u => u._id !== id))
    } catch (_) {}
  }

  const handleUnfollow = async (id) => {
    try {
      await userService.unfollowUser(id)
      // Optionally update suggestions UI
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your feed...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
          <p className="font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={fetchPosts} 
          className="mt-4 px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-glow transition-all flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold gradient-text">Your Feed</h1>
        <button
          onClick={fetchPosts}
          className="p-2 rounded-xl glass border border-white/30 hover:bg-white/50 transition-all hover:scale-105"
          title="Refresh feed"
        >
          <FiRefreshCw className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">No posts yet</p>
          <p className="text-gray-400 text-sm mt-2">Start following people to see their posts here</p>
          {/* Suggestions to follow */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Suggested for you</h3>
            <div className="space-y-3" id="suggestionsList">
              {suggestions.length === 0 ? (
                <p className="text-sm text-gray-400">No suggestions available</p>
              ) : (
                suggestions.map((s) => (
                  <div key={s._id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={resolveMediaUrl(s.profileImage || '/default-avatar.png')} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-gray-400">{s.profession || s.email}</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => handleFollow(s._id)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Follow</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>        </div>
      ) : (
        <div className="space-y-6">{posts.map((post) => (<PostCard key={post._id} post={post} onUpdate={fetchPosts} />))}</div>
      )}
    </div>
  )
}

export default Feed
