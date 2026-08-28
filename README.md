# GoLearn — Interactive Go Learning Platform

> **Learn Go. The Elegant Way.**

Platform pembelajaran Go interaktif, bilingual (ID/EN), terinspirasi Apple HIG design.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | shadcn/ui (Radix UI + Tailwind CSS) |
| Animations | GSAP + ScrollTrigger |
| Editor | Monaco Editor (VS Code engine) |
| Backend | Go 1.25 + Chi router |
| Database | PostgreSQL 15 |
| Auth | JWT + bcrypt + Google/GitHub OAuth |
| Infra | Docker + Docker Compose |

## Features

- **76 Lessons** across 15 Go topics (Beginner → Advanced)
- **Bilingual** content (Bahasa Indonesia + English)
- **Code Editor** — Run Go code directly in browser
- **Quiz & Assessment** — 3-5 questions per lesson with animated feedback
- **XP & Gamification** — Levels, streaks, badges, leaderboard
- **Discussion** — Threaded comments per lesson
- **Dashboard** — Personal progress analytics
- **Search** — Global `Ctrl+K` command palette
- **Playground** — Free sandbox with share via URL

## Security Notes

- Backend now applies baseline security headers.
- Auth, executor, and discussion endpoints have lightweight rate limiting.
- JSON API endpoints use stricter request body parsing and body-size limits.
- Code execution has concurrency throttling and output truncation to reduce abuse.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Go 1.22+
- Node.js 20+

### 1. Clone & setup env

```bash
git clone https://github.com/Kahfi10/go-learning.git
cd go-learning
cp .env.example .env
# Edit .env — set JWT_SECRET, GOOGLE/GITHUB OAuth keys
```

### 2. Run with Docker Compose

```bash
docker compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## Auth Cookie Config

Untuk production di satu domain yang sama (mis. reverse proxy DuckDNS):

```env
AUTH_COOKIE_NAME=access_token
AUTH_COOKIE_PATH=/
AUTH_COOKIE_DOMAIN=your-subdomain.duckdns.org
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=lax
```

Catatan:
- `AUTH_COOKIE_SECURE=true` wajib saat HTTPS aktif.
- Jika frontend dan backend diproxy lewat domain yang sama, `SameSite=Lax` biasanya cukup dan paling stabil.
- Biarkan `AUTH_COOKIE_DOMAIN` kosong saat development lokal.

### 3. Run migrations

```bash
# Connect to postgres and run:
psql postgres://golearn:golearn_secret@localhost:5432/golearn -f backend/internal/db/migrations/001_users.sql
psql postgres://golearn:golearn_secret@localhost:5432/golearn -f backend/internal/db/migrations/002_progress.sql
psql postgres://golearn:golearn_secret@localhost:5432/golearn -f backend/internal/db/migrations/003_badges.sql
psql postgres://golearn:golearn_secret@localhost:5432/golearn -f backend/internal/db/migrations/004_discussions.sql
psql postgres://golearn:golearn_secret@localhost:5432/golearn -f backend/internal/db/migrations/005_indexes.sql
```

### 4. Run locally (dev)

**Backend:**
```bash
cd backend
go mod download
go run ./cmd/server
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Curriculum

| # | Topic | Level | Lessons |
|---|---|---|---|
| 01 | Getting Started | Beginner | 4 |
| 02 | Variables & Types | Beginner | 5 |
| 03 | Functions | Beginner | 6 |
| 04 | Control Structures | Beginner | 5 |
| 05 | Collections | Beginner | 6 |
| 06 | Structs & Methods | Beginner | 5 |
| 07 | Interfaces | Beginner | 5 |
| 08 | Pointers | Intermediate | 4 |
| 09 | Error Handling | Intermediate | 5 |
| 10 | Goroutines & Channels | Intermediate | 6 |
| 11 | Packages & Modules | Intermediate | 4 |
| 12 | File I/O & OS | Intermediate | 5 |
| 13 | Testing in Go | Advanced | 5 |
| 14 | HTTP & Web | Advanced | 6 |
| 15 | Go Patterns | Advanced | 5 |

**Total: 76 lessons**

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/google      → OAuth
GET    /api/auth/github      → OAuth
GET    /api/topics
GET    /api/topics/:slug
GET    /api/topics/:slug/lessons/:id
POST   /api/execute          → Run Go code (5s timeout)
GET    /api/leaderboard
GET    /api/progress         🔒
PUT    /api/progress/:t/:l   🔒
POST   /api/quiz/:id/submit  🔒
GET    /api/discussions/:t/:l
POST   /api/discussions      🔒
```

## Project Structure

```
go-learning/
├── backend/           Go API server
│   ├── cmd/server/    Entry point
│   ├── internal/      Handlers, services, middleware, executor
│   ├── data/content/  76 lesson JSON files
│   └── go.mod
├── frontend/          Next.js 14
│   ├── app/           App Router pages
│   ├── components/    UI components
│   ├── lib/           API client, utils, GSAP
│   └── hooks/         useProgress
├── docker-compose.yml
├── .env.example
└── PRD.md             Full Product Requirements Document
```

---

© 2026 GoLearn · Built for Go learners 🇮🇩
