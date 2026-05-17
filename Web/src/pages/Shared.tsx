import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, Users } from 'lucide-react'
import { api, type Note } from '../api/client'
import './Dashboard.css'

export default function Shared() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchSharedNotes = useCallback(async () => {
    try {
      setIsLoading(true)
      // We'll fetch all notes and filter shared ones, or use a specific endpoint
      // For now, get all notes (shared ones are included)
      const data = await api.notes.list()
      setNotes(data)
      setError('')
    } catch (err: any) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        setError('Failed to load shared notes')
      }
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchSharedNotes()
  }, [fetchSharedNotes])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading shared notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Shared with You</h1>
          <p className="dashboard-subtitle">
            Notes that others have shared with you
          </p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      {notes.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-icon" />
          <h3>No shared notes</h3>
          <p>When someone shares a note with you, it will appear here</p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note, index) => (
            <Link
              to={`/note/${note.id}`}
              key={note.id}
              className="note-item animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="note-item-content">
                <h3 className="note-item-title">{note.title}</h3>
                <p className="note-item-preview">{truncate(note.content, 140)}</p>
                <div className="note-item-meta">
                  <span className="note-item-date">
                    <Clock size={13} />
                    {formatDate(note.updated_at)}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="note-item-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
