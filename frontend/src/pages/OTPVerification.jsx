import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { demoCredentials } from '../utils/demoData.js'
import { FiPhone, FiKey, FiArrowRight, FiCheck } from 'react-icons/fi'

const OTPVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authService.verifyOtp(phone, code)
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
      } else {
        setError('Invalid code')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFillDemoCode = () => {
    setCode(demoCredentials.otpCode)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FiKey className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Verify OTP</h1>
            <p className="text-gray-600">Enter the code sent to your phone</p>
          </div>

          {error && (
            <div className="mb-6 glass border border-red-200/50 text-red-700 px-4 py-3 rounded-xl animate-slide-up">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiPhone className="w-5 h-5" />
              </div>
              <input
                value={phone}
                readOnly
                placeholder="Phone"
                className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl bg-white/30 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiKey className="w-5 h-5" />
              </div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter OTP Code"
                maxLength={6}
                className="w-full pl-12 pr-4 py-3.5 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400 text-center text-2xl font-mono tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 4}
              className="w-full px-6 py-3.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {DEMO && (
            <div className="mt-6 space-y-3">
              <div className="glass border border-white/30 rounded-xl p-4 text-sm">
                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  Demo OTP Code
                </div>
                <div className="text-gray-600">
                  Code: <span className="font-mono text-lg font-bold text-blue-600">{demoCredentials.otpCode}</span>
                </div>
              </div>
              <button
                onClick={handleFillDemoCode}
                className="w-full px-4 py-2.5 glass border border-white/30 text-gray-900 rounded-xl hover:bg-white/50 transition-all text-sm font-medium"
              >
                Fill Demo OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
