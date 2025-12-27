import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUser, demoCredentials } from '../utils/demoData.js'
import { authService } from '../services/authService.js'
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiSend } from 'react-icons/fi'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signup({ name, email, phone, password })
    setLoading(false)
    if (res.success) navigate('/')
    else setError(res.error || 'Signup failed')
  }

  const handleSendOtp = async () => {
    try {
      await authService.sendOtp(phone)
      navigate('/verify-otp', { state: { phone } })
    } catch (_) {}
  }

  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('user', JSON.stringify(demoUser))
    navigate('/')
  }

  const handleFillDemo = () => {
    setName(demoUser.name)
    setEmail(demoCredentials.email)
    setPhone(demoCredentials.phone)
    setPassword(demoCredentials.password)
  }

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

            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiPhone className="w-5 h-5" />
                </div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-4 py-3.5 glass border border-white/30 rounded-xl hover:bg-white/50 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FiSend className="w-4 h-4" />
                <span className="hidden sm:inline">OTP</span>
              </button>
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

          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <div className="mt-6 space-y-3">
              <div className="glass border border-white/30 rounded-xl p-4 text-sm">
                <div className="font-semibold text-gray-900 mb-2">Demo Credentials</div>
                <div className="space-y-1 text-gray-600">
                  <div>Name: <span className="font-mono text-xs">{demoUser.name}</span></div>
                  <div>Email: <span className="font-mono text-xs">{demoCredentials.email}</span></div>
                  <div>Phone: <span className="font-mono text-xs">{demoCredentials.phone}</span></div>
                  <div>Password: <span className="font-mono text-xs">{demoCredentials.password}</span></div>
                  <div>OTP: <span className="font-mono text-xs">{demoCredentials.otpCode}</span></div>
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
