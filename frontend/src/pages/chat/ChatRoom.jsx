import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { FiSend, FiArrowLeft, FiMoreVertical } from 'react-icons/fi'

const ChatRoom = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { messages, openConversation, sendMessage, socketRef } = useChat()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => { if (conversationId) openConversation(conversationId) }, [conversationId])
  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight }, [messages, conversationId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await sendMessage(conversationId, text)
      setText('')
      if (socketRef?.current) socketRef.current.emit('typing', { conversationId, typing: false })
    } catch (_) {}
  }

  let typingTimeout = null
  const handleTyping = (val) => {
    setText(val)
    if (!socketRef?.current) return
    if (typingTimeout) clearTimeout(typingTimeout)
    socketRef.current.emit('typing', { conversationId, typing: true })
    typingTimeout = setTimeout(() => { if (socketRef?.current) socketRef.current.emit('typing', { conversationId, typing: false }) }, 1000)
  }

  const conversationMessages = messages[conversationId] || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Chat Header */}
      <div className="glass rounded-2xl shadow-lg border border-white/30 p-4 mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 rounded-xl hover:bg-white/30 transition-all"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-3 flex-1 px-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div>
            <p className="font-semibold text-gray-900">Chat</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/30 transition-all">
          <FiMoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="glass rounded-2xl shadow-lg border border-white/30 h-[calc(100vh-280px)] flex flex-col overflow-hidden">
        <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-2">Start the conversation!</p>
              </div>
            </div>
          ) : (
            conversationMessages.map((msg) => {
              const isOwn = String(msg.user) === String(user?._id)
              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
                >
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {msg.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                          : 'glass border border-white/30 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/20 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-5 py-3 gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom

