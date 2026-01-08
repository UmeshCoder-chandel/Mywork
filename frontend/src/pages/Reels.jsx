// import { useState, useEffect, useRef } from 'react'
// import { FiHeart, FiMessageCircle, FiSend, FiMoreVertical, FiBookmark } from 'react-icons/fi'
// import { FaHeart } from 'react-icons/fa'
// import { demoUsers, demoPosts } from '../utils/demoData.js'
// import { Link, useNavigate } from 'react-router-dom'
// import { postService } from '../services/postService.js'
// import { useAuth } from '../context/AuthContext.jsx'
// import resolveMediaUrl from '../utils/resolveMediaUrl.js'
// import { toast } from 'react-hot-toast'

// const ReelItem = ({ post, isActive, onLike, onComment }) => {
//   const { user: currentUser } = useAuth()
//   const navigate = useNavigate()
//   const videoRef = useRef(null)
//   const [liked, setLiked] = useState(
//     post.likes?.some((likeId) => String(likeId) === String(currentUser?._id)) ||
//     (Array.isArray(post.likes) && post.likes.some((like) => String(like._id || like) === String(currentUser?._id))) ||
//     false
//   )
//   const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : (post.likes || 0))
//   const [playing, setPlaying] = useState(false)
//   const [muted, setMuted] = useState(true)
//   const [comment, setComment] = useState('')
//   const [comments, setComments] = useState([])
//   const [showComments, setShowComments] = useState(false)
//   const [commentsCount, setCommentsCount] = useState(post.comments || 0)

//   const videoMedia = post.media?.find(m => m.type === 'video') || (post.video ? { url: post.video, type: 'video' } : null)

//   useEffect(() => {
//     if (videoRef.current) {
//       if (isActive) {
//         videoRef.current.play().catch(() => {})
//         setPlaying(true)
//       } else {
//         videoRef.current.pause()
//         setPlaying(false)
//       }
//     }
//   }, [isActive])

//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.muted = muted
//     }
//   }, [muted])

//   const handleLike = async () => {
//     try {
//       const data = await postService.likePost(post._id)
//       if (data.post) {
//         const isLiked = data.post.likes?.some((likeId) => String(likeId) === String(currentUser?._id))
//         setLiked(isLiked)
//         setLikesCount(Array.isArray(data.post.likes) ? data.post.likes.length : 0)
//         if (onLike) onLike()
//       }
//     } catch (error) {
//       toast.error('Failed to like reel')
//     }
//   }

//   const handleComment = async (e) => {
//     e.preventDefault()
//     if (!comment.trim()) return
//     try {
//       const data = await postService.commentPost(post._id, comment)
//       if (data.comment) {
//         setComments([...comments, data.comment])
//         setComment('')
//         setCommentsCount(prev => prev + 1)
//         if (onComment) onComment()
//       }
//     } catch (error) {
//       toast.error('Failed to add comment')
//     }
//   }

//   const loadComments = async () => {
//     try {
//       const data = await postService.getComments(post._id)
//       setComments(data.comments || [])
//     } catch (_) {}
//   }

//   useEffect(() => {
//     if (showComments) loadComments()
//   }, [showComments])

//   if (!videoMedia) return null

//   return (
//     <div className="relative w-full h-full flex items-center justify-center bg-black">
//       <video
//         ref={videoRef}
//         src={resolveMediaUrl(videoMedia.url)}
//         className="w-full h-full object-cover"
//         loop
//         muted={muted}
//         playsInline
//         onPlay={() => setPlaying(true)}
//         onPause={() => setPlaying(false)}
//         onClick={() => setPlaying(!playing)}
//       />
      
//       {/* User info and description at bottom */}
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pb-6">
//         <div className="flex items-start gap-3 mb-3">
//           <Link 
//             to={`/profile/${post.user?._id || post.user}`}
//             className="flex items-center gap-2 hover:opacity-80 transition-opacity"
//           >
//             {post.user?.profileImage ? (
//               <img
//                 src={resolveMediaUrl(post.user.profileImage)}
//                 alt={post.user?.name}
//                 className="w-8 h-8 rounded-full object-cover border-2 border-white"
//               />
//             ) : (
//               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-200 flex items-center justify-center text-white font-bold text-xs border-2 border-white">
//                 {post.user?.name?.charAt(0).toUpperCase() || 'U'}
//               </div>
//             )}
//             <span className="font-semibold text-white text-sm">{post.user?.name || 'Unknown User'}</span>
//           </Link>
//         </div>
//         {(post.desc || post.description) && (
//           <p className="text-white text-sm mb-2 line-clamp-2">{post.desc || post.description}</p>
//         )}
//       </div>

//       {/* Actions on the right side */}
//       <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
//         <button
//           onClick={handleLike}
//           className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
//         >
//           {liked ? (
//             <FaHeart className="w-7 h-7 text-red-500 fill-current" />
//           ) : (
//             <FiHeart className="w-7 h-7" />
//           )}
//           <span className="text-xs font-semibold">{likesCount}</span>
//         </button>
        
//         <button
//           onClick={() => {
//             setShowComments(!showComments)
//             if (!showComments) loadComments()
//           }}
//           className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
//         >
//           <FiMessageCircle className="w-7 h-7" />
//           <span className="text-xs font-semibold">{commentsCount}</span>
//         </button>
        
//         <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
//           <FiSend className="w-7 h-7" />
//         </button>
        
//         <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
//           <FiBookmark className="w-7 h-7" />
//         </button>
        
//         <button
//           onClick={() => setMuted(!muted)}
//           className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
//         >
//           <div className="w-7 h-7 flex items-center justify-center">
//             {muted ? (
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
//               </svg>
//             ) : (
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
//               </svg>
//             )}
//           </div>
//         </button>
        
//         <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
//           <FiMoreVertical className="w-7 h-7" />
//         </button>
//       </div>

//       {/* Comments modal */}
//       {showComments && (
//         <div className="absolute inset-0 bg-black/95 flex flex-col">
//           <div className="flex items-center justify-between p-4 border-b border-white/20">
//             <h3 className="text-white font-semibold">Comments</h3>
//             <button
//               onClick={() => setShowComments(false)}
//               className="text-white hover:opacity-70 transition-opacity"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {comments.length === 0 ? (
//               <div className="text-center text-gray-400 mt-8">
//                 <p>No comments yet.</p>
//                 <p className="text-sm mt-2">Be the first to comment!</p>
//               </div>
//             ) : (
//               comments.map((commentItem) => (
//                 <div key={commentItem._id} className="flex items-start gap-3">
//                   {commentItem.user?.profileImage ? (
//                     <img
//                       src={resolveMediaUrl(commentItem.user.profileImage)}
//                       alt={commentItem.user?.name}
//                       className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                     />
//                   ) : (
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
//                       {commentItem.user?.name?.charAt(0).toUpperCase() || 'U'}
//                     </div>
//                   )}
//                   <div className="flex-1">
//                     <p className="text-white text-sm">
//                       <span className="font-semibold">{commentItem.user?.name || 'User'}</span>
//                       <span className="ml-2">{commentItem.text}</span>
//                     </p>
//                     <p className="text-gray-400 text-xs mt-1">
//                       {new Date(commentItem.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
          
//           <form onSubmit={handleComment} className="p-4 border-t border-white/20 flex gap-2">
//             {currentUser?.profileImage ? (
//               <img
//                 src={resolveMediaUrl(currentUser.profileImage)}
//                 alt={currentUser?.name}
//                 className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//               />
//             ) : (
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
//                 {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
//               </div>
//             )}
//             <input
//               type="text"
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Add a comment..."
//               className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
//             />
//             <button
//               type="submit"
//               disabled={!comment.trim()}
//               className="px-4 py-2 text-blue-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Post
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   )
// }

// const Reels = () => {
//   const [reels, setReels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [activeIndex, setActiveIndex] = useState(0)
//   const containerRef = useRef(null)
//   const hasLoadedRef = useRef(false)
//   const touchStartY = useRef(0)
//   const touchEndY = useRef(0)

//   useEffect(() => {
//     if (!hasLoadedRef.current) {
//       fetchReels()
//     }
//   }, [])

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!containerRef.current) return
//       const container = containerRef.current
//       const scrollTop = container.scrollTop
//       const containerHeight = container.clientHeight
//       const newActiveIndex = Math.round(scrollTop / containerHeight)
//       if (newActiveIndex !== activeIndex && newActiveIndex >= 0 && newActiveIndex < reels.length) {
//         setActiveIndex(newActiveIndex)
//       }
//     }

//     const container = containerRef.current
//     if (container) {
//       container.addEventListener('scroll', handleScroll)
//       return () => container.removeEventListener('scroll', handleScroll)
//     }
//   }, [reels.length, activeIndex])

//   // Touch handlers for swipe
//   const handleTouchStart = (e) => {
//     touchStartY.current = e.touches[0].clientY
//   }

//   const handleTouchEnd = (e) => {
//     touchEndY.current = e.changedTouches[0].clientY
//     handleSwipe()
//   }

//     const handleSwipe = () => {
//       const diff = touchStartY.current - touchEndY.current
//       const minSwipeDistance = 50

//       if (Math.abs(diff) > minSwipeDistance) {
//         if (diff > 0 && activeIndex < reels.length - 1) {
//           // Swipe up - next reel
//           const nextIndex = activeIndex + 1
//           setActiveIndex(nextIndex)
//           if (containerRef.current) {
//             containerRef.current.scrollTo({
//               top: nextIndex * containerRef.current.clientHeight,
//               behavior: 'smooth'
//             })
//           }
//         } else if (diff < 0 && activeIndex > 0) {
//           // Swipe down - previous reel
//           const prevIndex = activeIndex - 1
//           setActiveIndex(prevIndex)
//           if (containerRef.current) {
//             containerRef.current.scrollTo({
//               top: prevIndex * containerRef.current.clientHeight,
//               behavior: 'smooth'
//             })
//           }
//         }
//       }
//     }

//   const fetchReels = async (forceRefresh = false) => {
//     if (hasLoadedRef.current && reels.length > 0 && !forceRefresh) {
//       return
//     }
//     try {
//       setLoading(true)
//       if (import.meta.env.VITE_DEMO_MODE === 'true') {
//         const videoPosts = demoPosts.filter(p => p.video || (p.media && p.media.some(m => m.type === 'video')))
//         setReels(videoPosts)
//       } else {
//         const data = await postService.getReels()
//         setReels(data.posts || [])
//       }
//       hasLoadedRef.current = true
//     } catch (error) {
//       console.error('Failed to fetch reels:', error)
//       toast.error('Failed to load reels')
//       hasLoadedRef.current = true
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black z-50">
//       {loading ? (
//         <div className="w-full h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
//             <p className="text-white font-medium">Loading reels...</p>
//           </div>
//         </div>
//       ) : reels.length === 0 ? (
//         <div className="w-full h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
//               <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <p className="text-white font-medium text-lg">No reels available</p>
//             <p className="text-white/60 text-sm mt-2">Check back later for new content</p>
//           </div>
//         </div>
//       ) : (
//         <div
//           ref={containerRef}
//           onTouchStart={handleTouchStart}
//           onTouchEnd={handleTouchEnd}
//           className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
//         >
//           {reels.map((reel, index) => (
//             <div
//               key={reel._id}
//               className="w-full h-screen snap-start flex-shrink-0"
//             >
//               <ReelItem
//                 post={reel}
//                 isActive={index === activeIndex}
//                 onLike={fetchReels}
//                 onComment={fetchReels}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Reels
import { useState, useEffect, useRef } from 'react'
import { FiHeart, FiMessageCircle, FiSend, FiMoreVertical, FiBookmark } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { postService } from '../services/postService.js'
import { useAuth } from '../context/AuthContext.jsx'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'
import { toast } from 'react-hot-toast'

/* ---------------- Reel Item ---------------- */

const ReelItem = ({ post, isActive }) => {
  const { user: currentUser } = useAuth()
  const videoRef = useRef(null)

  const [liked, setLiked] = useState(
    post.likes?.some(id => String(id) === String(currentUser?._id))
  )
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [muted, setMuted] = useState(true)

  const videoMedia =
    post.media?.find(m => m.type === 'video') ||
    (post.video ? { url: post.video } : null)

  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [isActive])

  const handleLike = async () => {
    try {
      const res = await postService.likePost(post._id)
      setLikesCount(res.post.likes.length)
      setLiked(res.post.likes.includes(currentUser?._id))
    } catch {
      toast.error('Failed to like')
    }
  }

  if (!videoMedia) return null

  return (
    <div className="relative w-full h-[100svh] bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={resolveMediaUrl(videoMedia.url)}
        autoPlay
        muted={muted}
        loop
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <Link to={`/profile/${post.user?._id}`} className="flex items-center gap-2">
          {post.user?.profileImage ? (
            <img
              src={resolveMediaUrl(post.user.profileImage)}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
              {post.user?.name?.[0]}
            </div>
          )}
          <span className="text-white font-semibold text-sm">
            {post.user?.name || 'User'}
          </span>
        </Link>

        {post.desc && (
          <p className="text-white text-sm mt-2 line-clamp-2">
            {post.desc}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 text-white">
        <button onClick={handleLike} className="flex flex-col items-center">
          {liked ? <FaHeart className="text-red-500 text-2xl" /> : <FiHeart className="text-2xl" />}
          <span className="text-xs">{likesCount}</span>
        </button>

        <button className="flex flex-col items-center">
          <FiMessageCircle className="text-2xl" />
          <span className="text-xs">{post.comments || 0}</span>
        </button>

        <FiSend className="text-2xl" />
        <FiBookmark className="text-2xl" />

        <button onClick={() => setMuted(!muted)}>
          {muted ? '🔇' : '🔊'}
        </button>

        <FiMoreVertical className="text-2xl" />
      </div>
    </div>
  )
}

/* ---------------- Reels Page ---------------- */

const Reels = () => {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      setLoading(reels.length === 0)
      const res = await postService.getReels()
      setReels(res.posts || [])
    } catch {
      toast.error('Failed to load reels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight)
      setActiveIndex(index)
    }

    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        Loading reels...
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory md:snap-none"
      >
        {reels.map((reel, index) => (
          <div key={reel._id} className="snap-start">
            <ReelItem post={reel} isActive={index === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reels
