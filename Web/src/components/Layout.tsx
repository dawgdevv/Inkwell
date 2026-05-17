import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Feather, Menu, X, LogOut } from 'lucide-react'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <Feather className="brand-icon" size={24} />
            <span className="brand-name">Inkwell</span>
          </Link>

          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Notes
                </Link>
                <Link 
                  to="/shared" 
                  className={`nav-link ${isActive('/shared') ? 'nav-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Shared
                </Link>
                <Link 
                  to="/note/new" 
                  className="nav-link nav-link--cta"
                  onClick={() => setMenuOpen(false)}
                >
                  New Note
                </Link>
                <div className="nav-divider" />
                <button onClick={handleLogout} className="nav-link nav-link--logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'nav-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="nav-link nav-link--cta"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-text">
            <Feather size={14} />
            Inkwell — crafted with care
          </p>
          <Link to="/about" className="footer-link">About</Link>
        </div>
      </footer>
    </div>
  )
}
