import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { userService } from '../services/userService.js'
import { FiSearch, FiBell, FiX } from 'react-icons/fi'
import { useNotification } from '../context/NotificationContext.jsx'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const { unreadCount } = useNotification()

  const handleSearch = async (e) => {
    e?.preventDefault?.()
    if (!q.trim()) { setResults([]); return }
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setResults([])
    } else {
      try {
        setLoading(true)
        const data = await userService.searchUsers(q)
        setResults(data.users || data || [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      setLoading(false)
      setActiveIndex(-1)
      return
    }
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setResults([])
      return
    }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await userService.searchUsers(q)
        const list = data.users || data || []
        setResults(list)
        setOpen(Boolean(list.length))
        setActiveIndex(list.length ? 0 : -1)
      } catch {
        setResults([])
        setOpen(false)
        setActiveIndex(-1)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  const goProfile = (id) => {
    setOpen(false)
    setQ('')
    setResults([])
    navigate(`/profile/${id}`)
  }

  const onKeyDown = (e) => {
    if (!open && !loading) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => {
        const next = prev + 1
        return next >= results.length ? results.length - 1 : next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => {
        const next = prev - 1
        return next < 0 ? 0 : next
      })
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault()
        goProfile(results[activeIndex]._id)
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl gradient-text hover:scale-105 transition-transform">
          Yutosa
          {/* UMe */}
          {/* YuMe */}
        </Link>
        <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => { if (results.length) setOpen(true) }}
                onKeyDown={onKeyDown}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm placeholder:text-gray-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(''); setResults([]); setOpen(false); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              {loading && (
                <div className="absolute right-9 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                </div>
              )}
            </div>
            {open && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-xl border border-white/30 max-h-64 overflow-y-auto animate-slide-up">
                {results.map((u, idx) => (
                  <button
                    type="button"
                    key={u._id}
                    onClick={() => goProfile(u._id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/10 last:border-b-0 transition-colors flex items-center gap-3 ${idx === activeIndex ? 'bg-white/60' : 'hover:bg-white/50'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {u.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      {u.profession && <p className="text-xs text-gray-500">{u.profession}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {open && !loading && results.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-xl border border-white/30 p-3 text-sm text-gray-600">
                No users found
              </div>
            )}
          </form>
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-xl glass border border-white/30 hover:bg-white/50 transition-all hover:scale-105"
          >
            <FiBell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
