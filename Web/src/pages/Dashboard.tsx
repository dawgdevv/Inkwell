import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Clock, ChevronRight, FileText } from 'lucide-react'
import { api, type Note } from '../api/client'
import './Dashboard.css'

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await api.notes.list()
      setNotes(data)
      setError('')
    } catch (err: any) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        setError('Failed to load notes')
      }
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchNotes()
      return
    }
    try {
      setIsLoading(true)
      const data = await api.search(searchQuery)
      setNotes(data)
    } catch {
      setError('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading && notes.length === 0) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Your Notes</h1>
          <p className="dashboard-subtitle">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} captured
          </p>
        </div>
        <Link to="/note/new" className="new-note-btn">
          <Plus size={18} />
          <span>New Note</span>
        </Link>
      </header>

      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" className="search-clear" onClick={() => { setSearchQuery(''); fetchNotes(); }}>
            Clear
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {notes.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h3>No notes yet</h3>
          <p>Start capturing your thoughts and ideas</p>
          <Link to="/note/new" className="empty-cta">
            Create your first note
          </Link>
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
