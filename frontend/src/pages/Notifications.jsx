import { useNotification } from '../context/NotificationContext.jsx'
import { FiBell, FiCheck } from 'react-icons/fi'

const Notifications = () => {
  const { notifications, markAsRead } = useNotification()
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold gradient-text mb-6">Notifications</h1>
      <div className="glass rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FiBell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="flex items-start justify-between p-4 hover:bg-white/30 transition-colors animate-slide-up"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    <FiBell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{n.title || 'Notification'}</p>
                    <p className="text-sm text-gray-600 mt-1">{n.body || n.text}</p>
                  </div>
                </div>
                <button
                  onClick={() => markAsRead(n._id)}
                  className="ml-4 px-3 py-1.5 glass border border-white/30 rounded-lg hover:bg-white/50 transition-all flex items-center gap-2 text-sm font-medium flex-shrink-0"
                >
                  <FiCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

