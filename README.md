# Inkwell Notes

A full-stack multi-user notes application with version history, note sharing, and JWT-based authentication. Built with Go, React, and PostgreSQL (Neon).

---

## Features

- **JWT Authentication** — Secure register/login with bcrypt-hashed passwords.
- **CRUD Notes** — Create, read, update, and delete your personal notes.
- **Note Sharing** — Share notes with other registered users via email.
- **Version History** — Every edit is automatically saved as a version. Restore to any previous version.
- **Full-text Search** — Search through your own notes and notes shared with you.
- **Shared Notes Feed** — View all notes that other users have shared with you.
- **Responsive Web UI** — React + Vite SPA with a clean, modern interface.
- **OpenAPI Spec** — API documented at `/openapi.json`.
- **Embedded Frontend** — The Go server serves the built React app directly, so it's a single deployable binary.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Go 1.24 + Gin |
| **ORM** | GORM |
| **Database** | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| **Auth** | JWT (HS256) |
| **Frontend** | React 19 + Vite |
| **Styling** | CSS Modules + Lucide icons |
| **Container** | Docker + Docker Compose |

---

## Project Structure

```
.
├── cmd/server/main.go          # Application entrypoint
├── internal/
│   ├── config/                 # DB init, env config
│   ├── handlers/
│   │   ├── api/                # REST API handlers (notes, auth, search, share, versions)
│   │   └── web/                # Static HTML templates + SPA routes
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # GORM models (User, Note, NoteShare, NoteVersion)
│   ├── utils/                  # Password hashing, JWT helpers
│   └── web/dist/               # Embedded React build (auto-copied)
├── Web/                        # React SPA source
│   └── src/
│       ├── pages/              # Dashboard, Editor, Auth, About, Shared
│       ├── components/         # Layout, shared UI
│       └── api/                # API client
├── openapi.json                # OpenAPI 3.0 spec
├── Dockerfile                  # Multi-stage build (Go + Node)
├── docker-compose.yml          # One-command deployment
├── Makefile                    # build-ui, build, run, dev
└── .env / .env.example         # Environment config
```

---

## Quick Start

### Prerequisites

- Go 1.23+
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/dawgdevv/fi_money.git
cd fi_money
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Neon PostgreSQL — use the POOLED URL for the app
DATABASE_URL=postgresql://user:password@your-project-pooler.ap-southeast-1.aws.neon.tech/dbname?sslmode=require

JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=8080
```

> **Tip:** In your Neon dashboard, copy the **Pooled connection string** (ends in `-pooler`) for application use. Use the **Direct** string only for CLI/migrations.

### 3. Run Locally

```bash
# Run Go server in dev mode ( frontend must be built first if you want the UI )
go run ./cmd/server/main.go

# Or build everything and run
make build
./server
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Development

### Backend (Go)

```bash
# Run server without rebuilding frontend
go run ./cmd/server/main.go

# Format & lint
go fmt ./...
```

### Frontend (React)

```bash
cd Web
npm install
npm run dev       # Vite dev server
npm run build     # Production build -> ../web/dist
```

### Build & Deploy

```bash
# Build UI, copy to embed dir, compile Go binary
make build

# Run the compiled binary
make run

# Docker
docker-compose up --build
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Authenticate and get JWT |
| GET | `/about` | Public | App info |
| GET | `/notes` | JWT | List paginated notes you created |
| GET | `/shared-notes` | JWT | List notes shared with you |
| POST | `/notes` | JWT | Create a note |
| GET | `/notes/:id` | JWT | Get a single note (own or shared) |
| PUT | `/notes/:id` | JWT | Update a note (auto-saves version) |
| DELETE | `/notes/:id` | JWT | Delete a note |
| POST | `/notes/:id/share` | JWT | Share with another user |
| GET | `/notes/:id/versions` | JWT | View version history |
| POST | `/notes/:id/restore` | JWT | Restore to a previous version |
| GET | `/search?q=...` | JWT | Full-text search |
| GET | `/openapi.json` | Public | API specification |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string. Use the **Pooled** URL. |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens. |
| `PORT` | No | Server port. Defaults to `8080`. |

---

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build the image directly
docker build -t inkwell-notes .
docker run -p 8080:8080 --env-file .env inkwell-notes
```

---

## Custom Feature: Note Version History

Every time a note is updated, the previous state is automatically saved as a `NoteVersion`. Users can:

- View the complete history of a note (`GET /notes/:id/versions`).
- Restore the note to any previous version (`POST /notes/:id/restore`).

This provides a "Git-like" safety net for everyday note-taking — no more accidental overwrites.

---

## License

MIT

---

Built with passion by **Nishant Raj**
