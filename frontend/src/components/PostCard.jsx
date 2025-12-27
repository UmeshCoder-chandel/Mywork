import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { postService } from '../services/postService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { FiHeart, FiMessageCircle, FiSend, FiMoreVertical } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import MediaCarousel from './MediaCarousel.jsx'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(
    post.likes?.some((likeId) => String(likeId) === String(user?._id)) ||
    (Array.isArray(post.likes) && post.likes.some((like) => String(like._id || like) === String(user?._id))) ||
    false
  )
  const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : (post.likes || 0))
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)

  useEffect(() => {
    if (showComments && !commentsLoaded) loadComments()
  }, [showComments])

  const loadComments = async () => {
    try {
      const data = await postService.getComments(post._id)
      setComments(data.comments || [])
      setCommentsLoaded(true)
    } catch (_) {}
  }

  const handleLike = async () => {
    try {
      setLoading(true)
      const data = await postService.likePost(post._id)
      if (data.post) {
        const isLiked = data.post.likes?.some((likeId) => String(likeId) === String(user?._id))
        setLiked(isLiked)
        setLikesCount(Array.isArray(data.post.likes) ? data.post.likes.length : 0)
        if (onUpdate) onUpdate()
      }
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      setLoading(true)
      const data = await postService.commentPost(post._id, comment)
      if (data.comment) {
        setComments([...comments, data.comment])
        setComment('')
        if (onUpdate) onUpdate()
      }
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl shadow-lg overflow-hidden mb-6 border border-white/30 animate-slide-up hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <Link 
            to={`/profile/${post.user?._id || post.user}`} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {post.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{post.user?.name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">{post.user?.profession || 'Worker'}</p>
            </div>
          </Link>
          <button className="p-2 rounded-lg hover:bg-white/30 transition-colors">
            <FiMoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Media */}
      {Array.isArray(post.media) && post.media.length > 0 ? (
        <MediaCarousel media={post.media} />
      ) : post.video || (post.media && post.media.type && post.media.type.startsWith('video')) ? (
        <div className="w-full bg-black">
          <video 
            src={resolveMediaUrl(post.video || post.media?.url || (post.image && post.image.endsWith('.mp4') ? post.image : ''))} 
            controls 
            className="w-full h-auto object-contain bg-black" 
          />
        </div>
      ) : post.image ? (
        <div className="w-full overflow-hidden">
          <img 
            src={resolveMediaUrl(post.image)} 
            alt="Work" 
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found' }} 
          />
        </div>
      ) : null}

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-gray-800 mb-4 leading-relaxed">{post.desc || post.description}</p>
        
        {/* Actions */}
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={handleLike} 
            disabled={loading} 
            className={`flex items-center gap-2 transition-all duration-200 ${
              liked 
                ? 'text-red-500 hover:scale-110' 
                : 'text-gray-600 hover:text-red-500 hover:scale-110'
            }`}
          >
            {liked ? (
              <FaHeart className="w-6 h-6 fill-current animate-scale-in" />
            ) : (
              <FiHeart className="w-6 h-6 stroke-current" />
            )}
            <span className="font-semibold">{likesCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)} 
            className={`flex items-center gap-2 transition-all duration-200 ${
              showComments 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            } hover:scale-110`}
          >
            <FiMessageCircle className="w-6 h-6" />
            <span className="font-semibold">{post.comments || comments.length}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-white/20 pt-4 mt-4 animate-fade-in">
            <div className="max-h-60 overflow-y-auto mb-4 space-y-3 pr-2">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((commentItem) => (
                  <div key={commentItem._id || commentItem.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {commentItem.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 glass rounded-xl px-3 py-2">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">{commentItem.user?.name || 'User'}</span>
                        <span className="text-gray-700 ml-2">{commentItem.text}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                type="text" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Add a comment..." 
                className="flex-1 px-4 py-2.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm placeholder:text-gray-400" 
                disabled={loading} 
              />
              <button 
                type="submit" 
                disabled={loading || !comment.trim()} 
                className="px-4 py-2.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default PostCard

