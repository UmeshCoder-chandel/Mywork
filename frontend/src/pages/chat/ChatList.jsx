import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChat } from '../../context/ChatContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { FiMessageCircle } from 'react-icons/fi'
import resolveMediaUrl from '../../utils/resolveMediaUrl.js'

const ChatList = () => {
  const { conversations } = useChat()
  const { user } = useAuth()
  
  useEffect(() => {}, [conversations])

  // Get other participants (excluding current user)
  const getOtherParticipants = (participants) => {
    if (!participants || !Array.isArray(participants)) return []
    return participants.filter(p => {
      const participantId = p._id || p
      return String(participantId) !== String(user?._id)
    })
  }

  // Get conversation name (other participants' names)
  const getConversationName = (conv) => {
    const others = getOtherParticipants(conv.participants)
    if (others.length === 0) return 'Conversation'
    return others.map(p => p.name || 'User').filter(Boolean).join(', ')
  }

  // Get conversation avatar (first other participant)
  const getConversationAvatar = (conv) => {
    const others = getOtherParticipants(conv.participants)
    if (others.length === 0) return null
    const firstOther = others[0]
    return firstOther
  }

  const isUnread = (conv) => {
    const last = conv.lastMessage
    if (!last) return false
    const fromOther = String(last.sender?._id || last.sender) !== String(user?._id)
    return fromOther && !last.read
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold gradient-text mb-6">Messages</h1>
      <div className="glass rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FiMessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No conversations yet</p>
            <p className="text-gray-400 text-sm mt-2">Start a conversation with someone!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {conversations.map((conv) => {
              const otherUser = getConversationAvatar(conv)
              const conversationName = getConversationName(conv)
              const unread = isUnread(conv)
              
              return (
                <Link
                  key={conv._id}
                  to={`/chat/${conv._id}`}
                  className="block p-4 hover:bg-white/30 transition-colors animate-slide-up"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {otherUser?.profileImage ? (
                        <img
                          src={resolveMediaUrl(otherUser.profileImage)}
                          alt={conversationName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 ${otherUser?.profileImage ? 'hidden' : ''}`}>
                        {(otherUser?.name || conversationName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${unread ? 'text-gray-900' : 'text-gray-800'}`}>
                          {conversationName}
                        </p>
                        <p className={`text-sm truncate ${unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {conv.lastMessage?.text?.slice(0, 60) || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {unread && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      <span className="text-xs text-gray-500">
                        {conv.updatedAt ? formatTime(conv.updatedAt) : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList

