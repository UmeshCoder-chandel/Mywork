import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { userService } from '../services/userService.js'
import { FiSearch, FiBell, FiX } from 'react-icons/fi'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault?.()
    if (!q.trim()) { setResults([]); return }
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setResults([])
    } else {
      try {
        const data = await userService.searchUsers(q)
        setResults(data.users || data || [])
        setOpen(true)
      } catch {
        setResults([])
      }
    }
  }

  const goProfile = (id) => {
    setOpen(false)
    setQ('')
    setResults([])
    navigate(`/profile/${id}`)
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
            </div>
            {open && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-xl border border-white/30 max-h-64 overflow-y-auto animate-slide-up">
                {results.map((u) => (
                  <button
                    type="button"
                    key={u._id}
                    onClick={() => goProfile(u._id)}
                    className="w-full text-left px-4 py-3 hover:bg-white/50 border-b border-white/10 last:border-b-0 transition-colors flex items-center gap-3"
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
          </form>
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-xl glass border border-white/30 hover:bg-white/50 transition-all hover:scale-105"
          >
            <FiBell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
