const API_BASE = ''

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, error.message || 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export type User = {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type NoteVersion = {
  id: string
  note_id: string
  title: string
  content: string
  created_at: string
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ message: string }>('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ access_token: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  notes: {
    list: (page = 1, limit = 10) =>
      request<Note[]>(`/notes?page=${page}&limit=${limit}`),
    get: (id: string) => request<Note>(`/notes/${id}`),
    create: (title: string, content: string) =>
      request<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      }),
    update: (id: string, title: string, content: string) =>
      request<Note>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      }),
    delete: (id: string) =>
      request<void>(`/notes/${id}`, { method: 'DELETE' }),
    share: (id: string, email: string) =>
      request<{ message: string }>(`/notes/${id}/share`, {
        method: 'POST',
        body: JSON.stringify({ share_with_email: email }),
      }),
  },

  search: (query: string) => request<Note[]>(`/search?q=${encodeURIComponent(query)}`),

  versions: {
    list: (noteId: string) => request<NoteVersion[]>(`/notes/${noteId}/versions`),
    restore: (noteId: string, versionId: string) =>
      request<Note>(`/notes/${noteId}/restore`, {
        method: 'POST',
        body: JSON.stringify({ version_id: versionId }),
      }),
  },

  about: () => request<{
    name: string
    email: string
    'my features': Record<string, string>
  }>('/about'),

  sharedNotes: (page = 1, limit = 10) =>
    request<Note[]>(`/shared-notes?page=${page}&limit=${limit}`),
}

export { ApiError }
