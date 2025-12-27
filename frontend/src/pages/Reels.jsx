import { useState } from 'react'
import { FiVideo } from 'react-icons/fi'
import { demoUsers, demoPosts } from '../utils/demoData.js'
import { Link } from 'react-router-dom'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

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

const Reels = () => {
  // keep simple demo suggestions
  const [users] = useState(demoUsers.slice(1))
  const [posts] = useState(demoPosts)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold gradient-text mb-6">Reels</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          <div className="w-full h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FiVideo className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-400 font-medium text-lg">No reels available</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for new content</p>
            </div>
          </div>
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

