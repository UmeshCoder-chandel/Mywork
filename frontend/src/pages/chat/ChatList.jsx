import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChat } from '../../context/ChatContext.jsx'
import { FiMessageCircle } from 'react-icons/fi'

const ChatList = () => {
  const { conversations } = useChat()
  useEffect(() => {}, [conversations])
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold gradient-text mb-6">Messages</h1>
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
            {conversations.map((conv) => (
              <Link
                key={conv._id}
                to={`/chat/${conv._id}`}
                className="block p-4 hover:bg-white/30 transition-colors animate-slide-up"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conv.participants?.[0]?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.participants?.map(p => p.name).filter(Boolean).join(', ') || 'Conversation'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage?.text?.slice(0, 60) || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList

