import { useState, useEffect, useRef } from 'react'
import { FiVideo, FiHeart, FiMessageCircle, FiSend, FiMoreVertical, FiPlay, FiPause } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { demoUsers, demoPosts } from '../utils/demoData.js'
import { Link } from 'react-router-dom'
import { postService } from '../services/postService.js'
import { useAuth } from '../context/AuthContext.jsx'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'
import { toast } from 'react-hot-toast'

const SuggestedUser = ({ user, onToggle }) => {
  const [following, setFollowing] = useState(false)
  const toggle = () => {
    setFollowing((s) => !s)
    onToggle?.(user)
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.profession || 'Worker'}</div>
        </div>
      </div>
      <button onClick={toggle} className={`px-3 py-1 text-sm rounded ${following ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white'}`}>
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

const SuggestedPost = ({ post }) => {
  return (
    <Link to={`/profile/${post.user?._id || post.user}`} className="flex items-center gap-3 hover:bg-white/5 p-2 rounded">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
        {post.image ? (
          <img src={resolveMediaUrl(post.image)} className="w-full h-full object-cover" />
        ) : post.video ? (
          <video src={resolveMediaUrl(post.video)} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="text-sm">
        <div className="font-semibold text-gray-900">{post.user?.name || 'Unknown'}</div>
        <div className="text-xs text-gray-500">{post.desc || post.description || 'View profile'}</div>
      </div>
    </Link>
  )
}

const ReelItem = ({ post, isActive, onLike, onComment }) => {
  const { user: currentUser } = useAuth()
  const videoRef = useRef(null)
  const [liked, setLiked] = useState(
    post.likes?.some((likeId) => String(likeId) === String(currentUser?._id)) ||
    (Array.isArray(post.likes) && post.likes.some((like) => String(like._id || like) === String(currentUser?._id))) ||
    false
  )
  const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : (post.likes || 0))
  const [playing, setPlaying] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)

  const videoMedia = post.media?.find(m => m.type === 'video') || (post.video ? { url: post.video, type: 'video' } : null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {})
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }, [isActive])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        videoRef.current.play()
        setPlaying(true)
      }
    }
  }

  const handleLike = async () => {
    try {
      const data = await postService.likePost(post._id)
      if (data.post) {
        const isLiked = data.post.likes?.some((likeId) => String(likeId) === String(currentUser?._id))
        setLiked(isLiked)
        setLikesCount(Array.isArray(data.post.likes) ? data.post.likes.length : 0)
        if (onLike) onLike()
      }
    } catch (error) {
      toast.error('Failed to like reel')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      const data = await postService.commentPost(post._id, comment)
      if (data.comment) {
        setComments([...comments, data.comment])
        setComment('')
        if (onComment) onComment()
      }
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const loadComments = async () => {
    try {
      const data = await postService.getComments(post._id)
      setComments(data.comments || [])
    } catch (_) {}
  }

  useEffect(() => {
    if (showComments) loadComments()
  }, [showComments])

  if (!videoMedia) return null

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={resolveMediaUrl(videoMedia.url)}
        className="w-full h-full object-contain"
        loop
        muted={false}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      
      {/* Play/Pause overlay */}
      <button
        onClick={handlePlayPause}
        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
      >
        {!playing && (
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
            <FiPlay className="w-10 h-10 text-white" />
          </div>
        )}
      </button>

      {/* Bottom overlay with info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${post.user?._id || post.user}`} className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-200 flex items-center justify-center text-white font-bold">
                {post.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-white">{post.user?.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-300">{post.user?.profession || 'Worker'}</p>
              </div>
            </div>
            <p className="text-white text-sm mb-2">{post.desc || post.description}</p>
          </Link>
          
          {/* Actions */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
            >
              {liked ? (
                <FaHeart className="w-7 h-7 text-red-500 fill-current" />
              ) : (
                <FiHeart className="w-7 h-7" />
              )}
              <span className="text-xs font-semibold">{likesCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
            >
              <FiMessageCircle className="w-7 h-7" />
              <span className="text-xs font-semibold">{post.comments || comments.length}</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
              <FiSend className="w-7 h-7" />
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
              <FiMoreVertical className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
            {comments.map((commentItem) => (
              <div key={commentItem._id} className="flex items-start gap-2 text-white text-sm">
                <span className="font-semibold">{commentItem.user?.name || 'User'}:</span>
                <span>{commentItem.text}</span>
              </div>
            ))}
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

const Reels = () => {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [users] = useState(demoUsers.slice(1))
  const [posts] = useState(demoPosts)
  const containerRef = useRef(null)
  const reelRefs = useRef([])

  useEffect(() => {
    fetchReels()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const newActiveIndex = Math.round(scrollTop / containerHeight)
      if (newActiveIndex !== activeIndex && newActiveIndex >= 0 && newActiveIndex < reels.length) {
        setActiveIndex(newActiveIndex)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [reels.length, activeIndex])

  const fetchReels = async () => {
    try {
      setLoading(true)
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        // Filter demo posts to only show videos
        const videoPosts = demoPosts.filter(p => p.video || (p.media && p.media.some(m => m.type === 'video')))
        setReels(videoPosts)
      } else {
        const data = await postService.getReels()
        setReels(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error)
      toast.error('Failed to load reels')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold gradient-text mb-6">Reels</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          {loading ? (
            <div className="w-full h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-400 font-medium">Loading reels...</p>
              </div>
            </div>
          ) : reels.length === 0 ? (
            <div className="w-full h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <FiVideo className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium text-lg">No reels available</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new content</p>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full h-[70vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            >
              {reels.map((reel, index) => (
                <div
                  key={reel._id}
                  ref={(el) => (reelRefs.current[index] = el)}
                  className="w-full h-[70vh] snap-start flex-shrink-0"
                >
                  <ReelItem
                    post={reel}
                    isActive={index === activeIndex}
                    onLike={fetchReels}
                    onComment={fetchReels}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="glass rounded-2xl shadow-lg border border-white/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Suggested</h2>
            <Link to="/search" className="text-xs text-blue-600">See all</Link>
          </div>

          <div className="space-y-3 mb-4">
            <h3 className="text-xs text-gray-500 uppercase">Suggested follows</h3>
            {users.map((u) => (
              <SuggestedUser key={u._id} user={u} />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs text-gray-500 uppercase">Suggested for you</h3>
            {posts.map((p) => (
              <SuggestedPost key={p._id} post={p} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Reels

