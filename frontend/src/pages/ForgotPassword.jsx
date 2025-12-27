import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      setMessage(res.message || 'If an account exists, a reset link was sent')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-gray-600 text-sm">Enter your email to receive a password reset link</p>
          </div>

          {message && <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{message}</div>}
          {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full px-3 py-2 border rounded" />
            <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
