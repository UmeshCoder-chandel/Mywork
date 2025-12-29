import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUser, demoCredentials } from '../utils/demoData.js'
import { FiMail, FiPhone, FiLock, FiArrowRight } from 'react-icons/fi'
import { authService } from '../services/authService.js'

const Login = () => {
  const { login, updateUser } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = { email: identifier.includes('@') ? identifier : '', phone: identifier.includes('@') ? '' : identifier, password }
    const res = await login(data)
    setLoading(false)
    if (res.success) navigate('/')
    else setError(res.error || 'Login failed')
  }

  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('user', JSON.stringify(demoUser))
    navigate('/')
  }

  const handleFillDemo = () => {
    setIdentifier(demoCredentials.email)
    setPassword(demoCredentials.password)
  }

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!googleClientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set')
      setError('Google login is not configured')
      return
    }

    const handleGoogleResponse = async (resp) => {
      if (!resp || !resp.credential) {
        setError('Google login failed: No credential received')
        return
      }
      try {
        setError('')
        setLoading(true)
        const data = await authService.googleLogin(resp.credential)
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          updateUser(data.user)
          navigate('/')
        } else {
          setError(data.message || 'Google login failed: No token received')
        }
      } catch (err) {
        console.error('Google login error:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Google login failed'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({ 
            client_id: googleClientId, 
            callback: handleGoogleResponse 
          })
          const buttonContainer = document.getElementById('googleBtn')
          if (buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, { 
              theme: 'outline', 
              size: 'large',
              text: 'signin_with',
              width: 300
            })
          } else {
            console.error('Google button container not found')
          }
        } catch (err) {
          console.error('Google initialization error:', err)
          setError('Failed to initialize Google login')
        }
      } else {
        console.error('Google Identity Services not loaded')
        setError('Google login service failed to load')
      }
    }
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script')
      setError('Failed to load Google login service')
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [navigate, updateUser])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to iWorkSocial</p>
          </div>

          {error && (
            <div className="mb-6 glass border border-red-200/50 text-red-700 px-4 py-3 rounded-xl animate-slide-up">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                {identifier.includes('@') ? <FiMail className="w-5 h-5" /> : <FiPhone className="w-5 h-5" />}
              </div>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Phone"
                className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div id="googleBtn" className="flex-1"></div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline ml-4">Forgot password?</Link>
            </div>
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-yellow-600 text-center">Google login is not configured</p>
            )}
          </div>

          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <div className="mt-6 space-y-3">
              <div className="glass border border-white/30 rounded-xl p-4 text-sm">
                <div className="font-semibold text-gray-900 mb-2">Demo Credentials</div>
                <div className="space-y-1 text-gray-600">
                  <div>Email: <span className="font-mono text-xs">{demoCredentials.email}</span></div>
                  <div>Phone: <span className="font-mono text-xs">{demoCredentials.phone}</span></div>
                  <div>Password: <span className="font-mono text-xs">{demoCredentials.password}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFillDemo}
                  className="flex-1 px-4 py-2.5 glass border border-white/30 text-gray-900 rounded-xl hover:bg-white/50 transition-all text-sm font-medium"
                >
                  Fill Demo
                </button>
                <button
                  onClick={handleDemoLogin}
                  className="flex-1 px-4 py-2.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm font-medium"
                >
                  Use Demo
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold gradient-text hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
