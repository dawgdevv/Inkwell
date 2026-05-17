import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Feather, ArrowRight } from 'lucide-react'
import { api } from '../api/client'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.auth.login(email, password)
      localStorage.setItem('token', response.access_token)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <Feather className="auth-logo" size={32} />
          <h1>Welcome back</h1>
          <p>Sign in to access your notes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/register">Get Started</Link>
        </div>
      </div>
    </div>
  )
}
