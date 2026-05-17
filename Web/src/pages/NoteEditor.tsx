import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Share2, Clock, RotateCcw, X, Sparkles } from 'lucide-react'
import { api, type NoteVersion } from '../api/client'
import { useAutocomplete } from '../hooks/useAutocomplete'
import './NoteEditor.css'

export default function NoteEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)

  const {
    suggestion,
    isLoading: isPredicting,
    acceptSuggestion,
    dismissSuggestion,
  } = useAutocomplete(textareaRef, content)

  // Sync scroll between textarea and ghost overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && ghostRef.current) {
      ghostRef.current.scrollTop = textareaRef.current.scrollTop
      ghostRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const fetchNote = useCallback(async () => {
    if (isNew) return
    try {
      const note = await api.notes.get(id!)
      setTitle(note.title)
      setContent(note.content)
      setError('')
    } catch (err: any) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        setError('Note not found')
      }
    } finally {
      setIsLoading(false)
    }
  }, [id, isNew, navigate])

  useEffect(() => {
    fetchNote()
  }, [fetchNote])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setIsSaving(true)
      setError('')
      if (isNew) {
        const note = await api.notes.create(title, content)
        navigate(`/note/${note.id}`)
      } else {
        await api.notes.update(id!, title, content)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await api.notes.delete(id!)
      navigate('/')
    } catch {
      setError('Failed to delete note')
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareEmail.trim()) return
    try {
      await api.notes.share(id!, shareEmail)
      setShareMessage('Note shared successfully!')
      setShareEmail('')
      setTimeout(() => setShareMessage(''), 3000)
    } catch (err: any) {
      setShareMessage(err.message || 'Failed to share')
    }
  }

  const loadVersions = async () => {
    if (!id) return
    try {
      setVersionsLoading(true)
      const data = await api.versions.list(id)
      setVersions(data)
    } catch {
      setError('Failed to load versions')
    } finally {
      setVersionsLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this version? Current content will be saved as a new version.')) return
    try {
      const note = await api.versions.restore(id!, versionId)
      setTitle(note.title)
      setContent(note.content)
      setShowVersions(false)
    } catch {
      setError('Failed to restore version')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestion) {
      if (e.key === 'Tab') {
        e.preventDefault()
        const newContent = acceptSuggestion()
        if (newContent) setContent(newContent)
        return
      }
      if (e.key === 'Escape') {
        dismissSuggestion()
        return
      }
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  // Determine if ghost text should show (only when cursor is at end)
  const showGhost =
    suggestion &&
    textareaRef.current &&
    textareaRef.current.selectionStart === content.length

  if (isLoading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner" />
        <p>Loading note...</p>
      </div>
    )
  }

  return (
    <div className="note-editor">
      <header className="editor-header">
        <button onClick={() => navigate('/')} className="editor-back btn-ghost">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="editor-actions">
          {!isNew && (
            <>
              <button 
                onClick={() => { loadVersions(); setShowVersions(true); }}
                className="btn-ghost"
                title="Version history"
              >
                <Clock size={18} />
              </button>
              <button 
                onClick={() => setShowShare(true)}
                className="btn-ghost"
                title="Share note"
              >
                <Share2 size={18} />
              </button>
              <button onClick={handleDelete} className="btn-danger" title="Delete">
                <Trash2 size={18} />
              </button>
            </>
          )}
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {error && <div className="editor-error">{error}</div>}

      <div className="editor-form">
        <input
          type="text"
          className="editor-title"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editor-content-wrapper">
          {showGhost && (
            <div
              ref={ghostRef}
              className="editor-ghost"
              aria-hidden="true"
            >
              {content}
              <span className="ghost-suggestion">{suggestion}</span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="editor-content"
            placeholder="Start writing..."
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            onScroll={handleScroll}
            rows={20}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
          {isPredicting && (
            <div className="autocomplete-loading" title="Thinking...">
              <Sparkles size={14} />
            </div>
          )}
        </div>
        {suggestion && (
          <div className="autocomplete-hint">
            <span className="autocomplete-hint-text">
              <kbd>Tab</kbd> to accept <strong>"{suggestion}"</strong>
            </span>
          </div>
        )}
      </div>

      {/* Share Panel */}
      {showShare && (
        <div className="panel-overlay" onClick={() => setShowShare(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Share Note</h3>
              <button onClick={() => setShowShare(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleShare} className="panel-body">
              <input
                type="email"
                placeholder="Enter email address..."
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">Share</button>
              {shareMessage && <p className="panel-message">{shareMessage}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Versions Panel */}
      {showVersions && (
        <div className="panel-overlay" onClick={() => setShowVersions(false)}>
          <div className="panel panel--wide" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Version History</h3>
              <button onClick={() => setShowVersions(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>
            <div className="panel-body">
              {versionsLoading ? (
                <div className="panel-loading">Loading versions...</div>
              ) : versions.length === 0 ? (
                <p className="panel-empty">No previous versions yet. Versions are created when you edit a note.</p>
              ) : (
                <div className="versions-list">
                  {versions.map((version) => (
                    <div key={version.id} className="version-item">
                      <div className="version-info">
                        <span className="version-date">{formatDate(version.created_at)}</span>
                        <span className="version-title">{version.title}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore(version.id)}
                        className="btn-secondary"
                        title="Restore this version"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
