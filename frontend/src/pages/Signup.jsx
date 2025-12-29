import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUser, demoCredentials } from '../utils/demoData.js'
import { authService } from '../services/authService.js'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

const Signup = () => {
  const { signup, updateUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const res = await signup({ name, email, password })
    setLoading(false)
    if (res.success) {
      if (res.needsEmailVerification) {
        setInfo(res.message || 'Signup successful. Please check your email to verify your account.')
      } else {
        navigate('/')
      }
    } else {
      setError(res.error || 'Signup failed')
    }
  }

  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('user', JSON.stringify(demoUser))
    navigate('/')
  }

  const handleFillDemo = () => {
    setName(demoUser.name)
    setEmail(demoCredentials.email)
    setPassword(demoCredentials.password)
  }

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    console.log('Google Client ID check:', googleClientId ? 'Found' : 'Not found', googleClientId)
    if (!googleClientId || googleClientId === 'your_google_client_id_here' || googleClientId.includes('your_')) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set or is using placeholder value:', googleClientId)
      setError('Google signup is not configured. Run: .\setup-google-auth.ps1 OR manually update frontend/.env with your Google OAuth Client ID from https://console.cloud.google.com/apis/credentials')
      return
    }

    const handleGoogleResponse = async (resp) => {
      if (!resp || !resp.credential) {
        setError('Google signup failed: No credential received')
        return
      }
      try {
        setError('')
        setInfo('')
        setLoading(true)
        const data = await authService.googleLogin(resp.credential)
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          updateUser(data.user)
          navigate('/')
        } else {
          setError(data.message || 'Google signup failed: No token received')
        }
      } catch (err) {
        console.error('Google signup error:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Google signup failed'
        const errorHint = err.response?.data?.hint || ''
        setError(errorMessage + (errorHint ? ` (${errorHint})` : ''))
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
          const target = document.getElementById('googleSignupBtn')
          if (target) {
            window.google.accounts.id.renderButton(target, { 
              theme: 'outline', 
              size: 'large',
              text: 'signup_with',
              width: 300
            })
          } else {
            console.error('Google signup button container not found')
          }
        } catch (err) {
          console.error('Google initialization error:', err)
          setError('Failed to initialize Google signup')
        }
      } else {
        console.error('Google Identity Services not loaded')
        setError('Google signup service failed to load')
      }
    }
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script')
      setError('Failed to load Google signup service')
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
            <h1 className="text-4xl font-bold gradient-text mb-2">Join iWorkSocial</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-6 glass border border-red-200/50 text-red-700 px-4 py-3 rounded-xl animate-slide-up">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {info && !error && (
            <div className="mb-6 glass border border-green-200/50 text-green-700 px-4 py-3 rounded-xl animate-slide-up">
              <p className="text-sm font-medium">{info}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiUser className="w-5 h-5" />
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div id="googleSignupBtn"></div>
            {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here' || import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your_')) && (
              <div className="text-xs text-yellow-600 text-center space-y-1">
                <p className="font-semibold">Google signup is not configured</p>
                <p className="text-xs">Get your Client ID from: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
                <p className="text-xs">Then update frontend/.env and backend/.env files</p>
              </div>
            )}
          </div>

          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <div className="mt-6 space-y-3">
              <div className="glass border border-white/30 rounded-xl p-4 text-sm">
                <div className="font-semibold text-gray-900 mb-2">Demo Credentials</div>
                <div className="space-y-1 text-gray-600">
                  <div>Name: <span className="font-mono text-xs">{demoUser.name}</span></div>
                  <div>Email: <span className="font-mono text-xs">{demoCredentials.email}</span></div>
                  {/* <div>Phone: <span className="font-mono text-xs">{demoCredentials.phone}</span></div> */}
                  <div>Password: <span className="font-mono text-xs">{demoCredentials.password}</span></div>
                  {/* <div>OTP: <span className="font-mono text-xs">{demoCredentials.otpCode}</span></div> */}
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
            Already have an account?{' '}
            <Link to="/login" className="font-semibold gradient-text hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
