import { useState } from 'react'
import { userService } from '../services/userService.js'
import { Link } from 'react-router-dom'
import { demoUsers } from '../utils/demoData.js'
import { FiSearch, FiUser } from 'react-icons/fi'

const Search = () => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!q.trim()) {
      setResults([])
      return
    }
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const filtered = demoUsers.filter(u => u.name.toLowerCase().includes(q.toLowerCase()))
      setResults(filtered)
    } else {
      const data = await userService.searchUsers(q)
      setResults(data.users || data || [])
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold gradient-text mb-6">Search</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              if (!e.target.value.trim()) setResults([])
            }}
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-3.5 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
          />
        </div>
      </form>
      <div className="glass rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        {results.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FiUser className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {q ? 'No users found' : 'Start typing to search for users'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {results.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="block p-4 hover:bg-white/30 transition-colors animate-slide-up"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    {u.profession && <p className="text-sm text-gray-600">{u.profession}</p>}
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

export default Search
