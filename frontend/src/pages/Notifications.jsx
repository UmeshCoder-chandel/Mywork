import { useNotification } from '../context/NotificationContext.jsx'
import { userService } from '../services/userService.js'
import { FiBell, FiCheck, FiPhone, FiCheckCircle, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

const Notifications = () => {
  const { notifications, markAsRead } = useNotification()
  const [processingRequests, setProcessingRequests] = useState(new Set())

  const getNotificationMessage = (notification) => {
    const senderName = notification.sender?.name || 'Someone'
    switch (notification.type) {
      case 'follow':
        return `${senderName} started following you`
      case 'like':
        return `${senderName} liked your post`
      case 'comment':
        return `${senderName} commented on your post`
      case 'message':
        return `${senderName} sent you a message`
      case 'phone_request':
        if (notification.meta?.approved) {
          return `Your phone number request to ${senderName} was approved`
        }
        return `${senderName} requested your phone number`
      default:
        return 'New notification'
    }
  }

  const handleApprovePhoneRequest = async (notification) => {
    const requestId = notification.meta?.requestId
    if (!requestId) return
    setProcessingRequests(prev => new Set(prev).add(requestId))
    try {
      await userService.approvePhoneRequest(requestId)
      toast.success('Phone request approved')
      markAsRead(notification._id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request')
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleDenyPhoneRequest = async (notification) => {
    const requestId = notification.meta?.requestId
    if (!requestId) return
    setProcessingRequests(prev => new Set(prev).add(requestId))
    try {
      await userService.denyPhoneRequest(requestId)
      toast.success('Phone request denied')
      markAsRead(notification._id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deny request')
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    n.type === 'phone_request' 
                      ? 'bg-gradient-to-br from-green-400 to-teal-500' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-500'
                  }`}>
                    {n.type === 'phone_request' ? (
                      <FiPhone className="w-5 h-5" />
                    ) : (
                      <FiBell className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {n.type === 'phone_request' && n.meta?.approved 
                        ? 'Phone Request Approved' 
                        : n.type === 'phone_request' 
                        ? 'Phone Number Request' 
                        : n.title || 'Notification'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{getNotificationMessage(n)}</p>
                    {n.type === 'phone_request' && n.meta?.phone && (
                      <p className="text-sm font-medium text-blue-600 mt-1">Phone: {n.meta.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {n.type === 'phone_request' && !n.meta?.approved && !n.read && (
                    <>
                      <button
                        onClick={() => handleApprovePhoneRequest(n)}
                        disabled={processingRequests.has(n.meta?.requestId)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleDenyPhoneRequest(n)}
                        disabled={processingRequests.has(n.meta?.requestId)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                        <span className="hidden sm:inline">Deny</span>
                      </button>
                    </>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="px-3 py-1.5 glass border border-white/30 rounded-lg hover:bg-white/50 transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

