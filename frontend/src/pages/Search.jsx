import { useState, useEffect, useRef } from 'react'
import { userService } from '../services/userService.js'
import { postService } from '../services/postService.js'
import { Link } from 'react-router-dom'
import { demoUsers, demoPosts } from '../utils/demoData.js'
import { FiSearch, FiX, FiUser, FiHash, FiMapPin } from 'react-icons/fi'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

const Search = () => {
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState('top')
  const [userResults, setUserResults] = useState([])
  const [postResults, setPostResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  const saveRecentSearch = (term, type = 'user') => {
    if (!term.trim()) return
    const newSearch = { term, type, timestamp: Date.now() }
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.term !== term)
      const updated = [newSearch, ...filtered].slice(0, 10)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleSearch = async (searchTerm = q) => {
    if (!searchTerm.trim()) {
      setUserResults([])
      setPostResults([])
      return
    }

    setLoading(true)
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        const filteredUsers = demoUsers.filter(u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.profession?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const filteredPosts = demoPosts.filter(p =>
          p.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setUserResults(filteredUsers)
        setPostResults(filteredPosts)
        saveRecentSearch(searchTerm)
      } else {
        const [usersData, postsData] = await Promise.all([
          userService.searchUsers(searchTerm).catch(() => ({ users: [] })),
          postService.searchPosts(searchTerm).catch(() => ({ posts: [] }))
        ])
        setUserResults(usersData.users || usersData || [])
        setPostResults(postsData.posts || postsData || [])
        saveRecentSearch(searchTerm)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (q.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(q)
      }, 300)
    } else {
      setUserResults([])
      setPostResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [q])

  const handleRecentSearchClick = (searchTerm) => {
    setQ(searchTerm)
    handleSearch(searchTerm)
  }

  const tabs = [
    { id: 'top', label: 'Top', icon: FiSearch },
    { id: 'accounts', label: 'Accounts', icon: FiUser },
    { id: 'tags', label: 'Tags', icon: FiHash },
    { id: 'places', label: 'Places', icon: FiMapPin },
  ]

  const renderTopResults = () => {
    if (!q.trim()) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent</h3>
            {recentSearches.length > 0 && (
              <button
                onClick={clearRecentSearches}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>
          {recentSearches.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No recent searches</p>
          ) : (
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearchClick(search.term)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiSearch className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{search.term}</p>
                    <p className="text-xs text-gray-500">{search.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            {userResults.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Accounts</h3>
                <div className="space-y-2">
                  {userResults.slice(0, 5).map((u) => (
                    <Link
                      key={u._id}
                      to={`/profile/${u._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {u.profileImage ? (
                        <img
                          src={resolveMediaUrl(u.profileImage)}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                        {u.profession && (
                          <p className="text-sm text-gray-500 truncate">{u.profession}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {postResults.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Posts</h3>
                <div className="grid grid-cols-3 gap-1">
                  {postResults.slice(0, 9).map((post) => (
                    <Link
                      key={post._id}
                      to={`/profile/${post.user?._id || post.user}`}
                      className="aspect-square bg-gray-200 overflow-hidden group relative"
                    >
                      {post.media?.[0] ? (
                        post.media[0].type === 'video' ? (
                          <video
                            src={resolveMediaUrl(post.media[0].url)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            muted
                          />
                        ) : (
                          <img
                            src={resolveMediaUrl(post.media[0].url)}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        )
                      ) : post.image ? (
                        <img
                          src={resolveMediaUrl(post.image)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiHash className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 text-white">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span className="text-sm font-semibold">{Array.isArray(post.likes) ? post.likes.length : post.likes || 0}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                            <span className="text-sm font-semibold">{post.comments || 0}</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && userResults.length === 0 && postResults.length === 0 && q.trim() && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiSearch className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-2">Try searching for something else</p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  const renderAccounts = () => {
    if (!q.trim()) {
      return (
        <div className="p-6 text-center text-gray-500">
          <p>Search for accounts</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      )
    }

    if (userResults.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No accounts found</p>
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="space-y-2">
          {userResults.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u._id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {u.profileImage ? (
                <img
                  src={resolveMediaUrl(u.profileImage)}
                  alt={u.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                {u.profession && (
                  <p className="text-sm text-gray-500 truncate">{u.profession}</p>
                )}
                {u.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{u.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const renderTags = () => {
    if (!q.trim()) {
      return (
        <div className="p-6 text-center text-gray-500">
          <p>Search for tags</p>
        </div>
      )
    }

    // Extract hashtags from posts
    const hashtags = postResults
      .flatMap(post => {
        const text = post.desc || post.description || ''
        const matches = text.match(/#\w+/g) || []
        return matches.map(tag => tag.slice(1))
      })
      .filter((tag, index, self) => self.indexOf(tag) === index)
      .slice(0, 20)

    if (hashtags.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No tags found</p>
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="space-y-4">
          {hashtags.map((tag, idx) => (
            <Link
              key={idx}
              to={`/search?q=${encodeURIComponent('#' + tag)}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                <FiHash className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">#{tag}</p>
                <p className="text-sm text-gray-500">
                  {postResults.filter(p => {
                    const text = (p.desc || p.description || '').toLowerCase()
                    return text.includes(tag.toLowerCase())
                  }).length} posts
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const renderPlaces = () => {
    if (!q.trim()) {
      return (
        <div className="p-6 text-center text-gray-500">
          <p>Search for places</p>
        </div>
      )
    }

    // Extract locations from users
    const places = userResults
      .map(u => u.location)
      .filter(Boolean)
      .filter((loc, index, self) => self.indexOf(loc) === index)
      .slice(0, 20)

    if (places.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No places found</p>
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="space-y-2">
          {places.map((place, idx) => (
            <Link
              key={idx}
              to={`/search?q=${encodeURIComponent(place)}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{place}</p>
                <p className="text-sm text-gray-500">
                  {userResults.filter(u => u.location === place).length} people
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full pl-12 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
            autoFocus
          />
          {q && (
            <button
              onClick={() => {
                setQ('')
                setUserResults([])
                setPostResults([])
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-white min-h-[calc(100vh-140px)]">
        {activeTab === 'top' && renderTopResults()}
        {activeTab === 'accounts' && renderAccounts()}
        {activeTab === 'tags' && renderTags()}
        {activeTab === 'places' && renderPlaces()}
      </div>
    </div>
  )
}

export default Search
