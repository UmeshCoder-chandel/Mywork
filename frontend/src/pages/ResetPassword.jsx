import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) setError('Reset token missing')
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await authService.resetPassword(token, password)
      // server returns token and sets cookie; also login client
      if (res.token) {
        localStorage.setItem('token', res.token)
      }
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-600 text-sm">Set a new password for your account</p>
          </div>

          {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="New password" className="w-full px-3 py-2 border rounded" />
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required placeholder="Confirm password" className="w-full px-3 py-2 border rounded" />
            <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
