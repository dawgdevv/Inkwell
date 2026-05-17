import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Feather, ArrowRight } from 'lucide-react'
import { api } from '../api/client'
import './Auth.css'

export default function Register() {
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
      await api.auth.register(email, password)
      const response = await api.auth.login(email, password)
      localStorage.setItem('token', response.access_token)
      navigate('/')
    } catch (err: any) {
      if (err.status === 409) {
        setError('Email already registered')
      } else {
        setError(err.message || 'Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <Feather className="auth-logo" size={32} />
          <h1>Get Started</h1>
          <p>Create your account to begin</p>
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
              placeholder="Min. 6 characters"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
