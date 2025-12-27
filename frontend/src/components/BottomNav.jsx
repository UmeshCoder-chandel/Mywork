import { NavLink } from 'react-router-dom'
import { FiHome, FiVideo, FiPlusCircle, FiMessageCircle, FiUser } from 'react-icons/fi'

const BottomNav = () => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/30 shadow-lg" 
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="max-w-4xl mx-auto h-16 px-2 grid grid-cols-5 gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50/50 scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/30'
            }`
          }
        >
          <FiHome className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </NavLink>
        <NavLink
          to="/reels"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50/50 scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/30'
            }`
          }
        >
          <FiVideo className="w-5 h-5" />
          <span className="text-xs font-medium">Reels</span>
        </NavLink>
        <NavLink
          to="/create-post"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50/50 scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/30'
            }`
          }
        >
          <div className="relative">
            <FiPlusCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Post</span>
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50/50 scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/30'
            }`
          }
        >
          <FiMessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Chat</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50/50 scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/30'
            }`
          }
        >
          <FiUser className="w-5 h-5" />
          <span className="text-xs font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNav

