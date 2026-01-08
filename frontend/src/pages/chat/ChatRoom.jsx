import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { FiSend, FiArrowLeft, FiMoreVertical } from 'react-icons/fi'
import resolveMediaUrl from '../../utils/resolveMediaUrl.js'

const ChatRoom = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { messages, openConversation, sendMessage, socketRef, conversations } = useChat()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const messagesRef = useRef(null)
  const loadedConversationIdRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)

  useEffect(() => { 
    if (conversationId && loadedConversationIdRef.current !== conversationId) {
      openConversation(conversationId)
      loadedConversationIdRef.current = conversationId
    }
  }, [conversationId])
  useEffect(() => { if (messagesRef.current && atBottom) messagesRef.current.scrollTop = messagesRef.current.scrollHeight }, [messages, conversationId, atBottom])

  // Get current conversation
  const currentConversation = conversations.find(c => c._id === conversationId)
  
  // Get other participants (excluding current user)
  const getOtherParticipants = (participants) => {
    if (!participants || !Array.isArray(participants)) return []
    return participants.filter(p => {
      const participantId = p._id || p
      return String(participantId) !== String(user?._id)
    })
  }

  const otherParticipants = currentConversation ? getOtherParticipants(currentConversation.participants) : []
  const chatWithUser = otherParticipants[0] || null
  const chatName = chatWithUser?.name || otherParticipants.map(p => p.name).filter(Boolean).join(', ') || 'Chat'

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
  const withSeparators = useMemo(() => {
    const out = []
    let lastDay = null
    for (const m of conversationMessages) {
      const d = new Date(m.createdAt)
      const dayKey = d.toDateString()
      if (dayKey !== lastDay) {
        lastDay = dayKey
        out.push({ _id: `sep-${dayKey}`, type: 'sep', label: d.toLocaleDateString() })
      }
      out.push({ ...m, type: 'msg' })
    }
    return out
  }, [conversationMessages])

  const onScroll = () => {
    if (!messagesRef.current) return
    const el = messagesRef.current
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20
    setAtBottom(nearBottom)
  }

  const onInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim()) {
        handleSend(e)
      }
    }
  }

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
          {chatWithUser?.profileImage ? (
            <img
              src={resolveMediaUrl(chatWithUser.profileImage)}
              alt={chatName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${chatWithUser?.profileImage ? 'hidden' : ''}`}>
            {chatName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{chatName}</p>
            <p className="text-xs text-gray-500">{currentConversation?.typing ? 'Typing...' : 'Active now'}</p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/30 transition-all">
          <FiMoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="glass rounded-2xl shadow-lg border border-white/30 h-[calc(100vh-280px)] flex flex-col overflow-hidden">
        <div ref={messagesRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-2">Start the conversation!</p>
              </div>
            </div>
          ) : (
            withSeparators.map((item) => {
              if (item.type === 'sep') {
                return (
                  <div key={item._id} className="flex justify-center">
                    <span className="text-xs text-gray-500 px-3 py-1 rounded-full bg-white/50">{item.label}</span>
                  </div>
                )
              }
              const msg = item
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
                    <div className={`flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'} px-2 mt-1`}>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                        <span className={`text-xs ${msg.read ? 'text-blue-600' : 'text-gray-400'}`}>
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!atBottom && (
          <div className="p-2">
            <button
              onClick={() => {
                if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
                setAtBottom(true)
              }}
              className="mx-auto block text-xs px-3 py-1 rounded-full glass border border-white/30 hover:bg-white/50"
            >
              New messages
            </button>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/20 flex gap-2">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Message..."
            className="flex-1 px-4 py-3 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400 resize-none"
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
