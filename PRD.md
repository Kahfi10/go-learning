# GoLearn — Product Requirements Document (PRD)

> **Versi:** 1.0  
> **Tanggal:** 2026-07-28  
> **Repo:** https://github.com/Kahfi10/go-learning  
> **Status:** Ready for Implementation

---

## Table of Contents

1. [Vision & Overview](#1-vision--overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Architecture](#4-architecture)
5. [10 Feature Modules](#5-10-feature-modules)
6. [Kurikulum Go — 15 Topik 76 Lessons](#6-kurikulum-go--15-topik-76-lessons)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [GSAP Animation Map](#9-gsap-animation-map)
10. [shadcn/ui Components](#10-shadcnui-components)
11. [Tasks Breakdown](#11-tasks-breakdown)
12. [Timeline](#12-timeline)

---

## 1. Vision & Overview

**GoLearn** adalah platform pembelajaran bahasa Go yang sepenuhnya interaktif, bilingual (ID/EN), dan terinspirasi estetika Apple HIG.

| | |
|---|---|
| **Tagline** | *"Learn Go. The elegant way."* |
| **Target user** | Developer pemula hingga menengah yang ingin belajar Go |
| **Differentiator** | Kode bisa langsung dijalankan di browser, gamifikasi XP/badge, diskusi per lesson |
| **Base repo** | Melanjutkan `github.com/Kahfi10/go-learning` |

---

## 2. Tech Stack

| Layer | Technology | Catatan |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR + RSC |
| UI Components | **shadcn/ui** (Radix UI + Tailwind CSS) | Seluruh design system |
| Animations | **GSAP + ScrollTrigger** | Menggantikan Framer Motion |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | Go syntax support |
| State / Fetch | TanStack Query v5 | Server state management |
| Backend | Go 1.22 + **Chi** router | REST API |
| Auth | JWT + bcrypt + OAuth (Google & GitHub) | httpOnly cookie |
| Database | **PostgreSQL 15** | Via Docker |
| DB Queries | **sqlc** + pgx/v5 | Type-safe, no ORM |
| Code Runner | `exec.CommandContext` + 5s timeout | Sandboxed |
| Containerization | Docker + Docker Compose | Dev + prod parity |

---

## 3. Design System

### Apple HIG Color Tokens

```css
:root {
  /* Backgrounds */
  --background:        0 0% 100%;        /* #FFFFFF — paper white */
  --bg-secondary:      240 5% 96%;       /* #F5F5F7 — soft surface */
  --bg-dark:           0 0% 0%;          /* #000000 — hero film mode */
  --code-surface:      0 0% 11%;         /* #1C1C1E — editor dark */

  /* Text */
  --foreground:        240 3% 11%;       /* #1D1D1F — Apple near-black */
  --muted-foreground:  240 4% 52%;       /* #86868B — captions */

  /* Accent */
  --accent:            211 100% 45%;     /* #0071E3 — system blue (hemat) */

  /* Border */
  --border:            240 6% 83%;       /* #D2D2D7 — hairline divider */

  /* Component */
  --card:              0 0% 100%;
  --radius:            0.75rem;          /* 12px base radius */
}
```

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Headline | Inter Tight (fallback SF Pro) | 48–72px | 600 |
| Sub-display | Inter Tight | 24–32px | 400 |
| Body | Inter | 17px | 400 |
| Caption | Inter | 12–14px | 400, color `#86868B` |
| Code | JetBrains Mono | 14px | 400 |

### Spacing Ladder

`4 / 8 / 16 / 24 / 40 / 64 / 96 / 160 px`

Section breaks: **160px+** vertikal. Headlines breathe.

### Border Radius

`12px` small — `18px` cards — `22px` large panels

### Shadow

Minimal: `0 1px 2px rgba(0,0,0,0.04)` — elevation via whitespace, bukan shadow.

### GSAP Standards

- **Easing:** `expo.out` untuk semua transisi
- **Duration layout:** `0.6s`
- **Duration micro (hover):** `0.2s`
- **ScrollTrigger:** `start: "top 80%"`, `end: "bottom 20%"`

---

## 4. Architecture

```
go-learning/
├── frontend/                          # Next.js 14
│   ├── app/
│   │   ├── (marketing)/page.tsx       # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── modules/
│   │   │   ├── page.tsx               # Topic catalog
│   │   │   └── [topic]/
│   │   │       ├── page.tsx           # Topic intro
│   │   │       └── [lesson]/
│   │   │           └── page.tsx       # Lesson + editor
│   │   ├── playground/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── profile/[username]/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   ├── editor/                    # Monaco wrapper + output
│   │   ├── lesson/                    # Prose, quiz, nav
│   │   ├── gamification/              # XP, badges, level-up
│   │   ├── discussion/                # Comments, upvotes
│   │   ├── dashboard/                 # Charts, activity
│   │   ├── search/                    # Command palette
│   │   └── navigation/                # Navbar, sidebar
│   ├── lib/
│   │   ├── api.ts                     # Typed fetch wrapper
│   │   ├── auth.ts                    # JWT helpers
│   │   ├── gsap.ts                    # GSAP plugin registration
│   │   └── progress.ts                # localStorage utilities
│   └── styles/globals.css
│
├── backend/                           # Go 1.22
│   ├── cmd/
│   │   ├── server/main.go             # Entry point
│   │   └── examples/                  # Existing Go learning code
│   ├── internal/
│   │   ├── handler/                   # HTTP handlers (chi)
│   │   ├── service/                   # Business logic
│   │   ├── executor/runner.go         # Code sandbox
│   │   ├── middleware/                # JWT, CORS, logger
│   │   └── db/
│   │       ├── migrations/            # SQL files
│   │       └── queries/               # sqlc query files
│   ├── data/content/                  # MDX lesson files
│   │   ├── topic-01-getting-started/
│   │   │   ├── meta.json
│   │   │   ├── lesson-01.mdx
│   │   │   └── ...
│   │   └── topic-[02..15]-*/
│   └── go.mod
│
└── docker-compose.yml
```

---

## 5. 10 Feature Modules

### Module 1 — Auth & Profile
- Register email/password + login form
- OAuth: Google & GitHub (redirect + callback)
- JWT disimpan sebagai httpOnly cookie
- Halaman profil: avatar (initials fallback), nama, stats, badges
- Settings: ubah nama, password, bahasa default, hapus akun

### Module 2 — Interactive Code Editor
- Monaco Editor dengan Go language support
- Toolbar: `Run ▶` · `Reset` · `Copy`
- `Ctrl/Cmd+Enter` shortcut untuk run
- Output panel: stdout, stderr, execution time badge
- Auto-save last code ke localStorage per lesson key
- shadcn `ResizablePanelGroup` — drag resize desktop
- Mobile: stacked layout (editor di bawah prose)

### Module 3 — Learning / Course Engine
- MDX-based lesson content rendering
- Bilingual toggle ID/EN (shadcn `Switch`, preference disimpan DB + localStorage)
- Lesson sidebar dengan checklist navigasi
- `ProseRenderer` — MDX → Apple-styled HTML
- Breadcrumb, estimated reading time, anchor TOC untuk lesson panjang

### Module 4 — Quiz & Assessment
- Multiple choice 3–5 soal per lesson
- GSAP animated feedback: shake (salah) / pulse (benar)
- Score summary setelah submit
- Retry — simpan best score
- Coding challenge di beberapa lesson (expected output validation)

### Module 5 — Progress & Gamification
- **XP:** +50 per lesson selesai, +25 bonus quiz sempurna
- **Level:** 10 level, dari *"Gopher Pemula"* → *"Go Expert"*
- **Streak:** harian, update `last_active` tiap login/lesson
- **Badges:** ~15 jenis (First Lesson, Speed Runner, Concurrency Master, dll)
- GSAP XP counter + level-up modal + badge earned animation

### Module 6 — Playground / Sandbox
- Full-width Monaco editor, tanpa kurikulum
- Template snippets dropdown: Hello World, HTTP Server, Goroutine, JSON, Sort, Channel
- Share via URL: kode di-encode base64 → `?code=...`
- Copy link button + sonner toast feedback

### Module 7 — Leaderboard
- Ranking berdasarkan total XP
- Filter: All Time / This Month / This Week (shadcn `Tabs`)
- Top 3: gold/silver/bronze crown badge
- Highlight baris user yang sedang login
- Pagination top 50, GSAP stagger row entrance

### Module 8 — Discussion / Community
- Komentar threaded per lesson (max 1 level reply)
- Upvote per komentar (1 per user, optimistic update)
- Pin komentar (admin)
- Sorting: Newest / Most Upvoted
- User bisa delete komentar sendiri

### Module 9 — Dashboard / Analytics
- Overview cards: XP, streak, lessons done, level
- Progress bar chart per topik (shadcn Recharts)
- Waktu belajar estimasi
- Recent activity feed
- "Continue Learning" card — lesson terakhir belum selesai

### Module 10 — Search & Discovery
- Global `Ctrl/Cmd+K` command palette (shadcn `Command`)
- Debounced search: topics, lessons, content
- Filter: Level (Beginner/Intermediate/Advanced)
- Keyboard navigasi (↑↓ Enter)
- Recent searches via localStorage

---

## 6. Kurikulum Go — 15 Topik, 76 Lessons

### Ringkasan per Level

| Level | Topik | Total Lessons |
|---|---|---|
| Beginner | 1–7 | 36 lessons |
| Intermediate | 8–12 | 24 lessons |
| Advanced | 13–15 | 16 lessons |
| **Total** | **15 topik** | **76 lessons** |

---

### Topik 1 — Getting Started with Go (4 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 1.1 | Apa itu Go? | Sejarah, filosofi, use cases, kenapa Go |
| 1.2 | Instalasi & Go CLI | Install Go, `go run`, `go build`, `go fmt`, `go vet` |
| 1.3 | Hello, World! | `package main`, `import`, `func main`, struktur file |
| 1.4 | Go Modules | `go mod init`, `go.mod`, `go.sum`, workspace |

---

### Topik 2 — Variables, Constants & Types (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 2.1 | Deklarasi variabel | `var` vs `:=`, short declaration |
| 2.2 | Tipe data primitif | int, float64, bool, string, rune, byte |
| 2.3 | Zero values & multiple assignment | Default values, tuple assignment |
| 2.4 | Constants & `iota` | `const`, `iota`, typed/untyped constants |
| 2.5 | Type conversion | Explicit casting, type aliases, `reflect` |

---

### Topik 3 — Functions (6 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 3.1 | Deklarasi fungsi | Parameter, return type, calling convention |
| 3.2 | Multiple return values | Tuple returns, idiomatic Go error pattern |
| 3.3 | Named return values | Named returns, naked return |
| 3.4 | Variadic functions | `...args`, spread operator |
| 3.5 | First-class functions | Function types, passing functions, callbacks |
| 3.6 | Closures | Closure state, factory pattern |

---

### Topik 4 — Control Structures (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 4.1 | if / else | Kondisi, short init statement, tanpa parentheses |
| 4.2 | for loop | C-style, while-style, infinite loop, `break`, `continue` |
| 4.3 | range | Iterasi slice, map, string, channel, blank identifier |
| 4.4 | switch | Expression switch, type switch, fallthrough |
| 4.5 | defer, panic, recover | Execution order, stack unwinding, recovery |

---

### Topik 5 — Arrays, Slices & Maps (6 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 5.1 | Arrays | Fixed-size, deklarasi, zero value, comparability |
| 5.2 | Slices dasar | `make`, literal, `append`, `len`, `cap` |
| 5.3 | Slice tricks | `copy`, slicing expression, grow strategy |
| 5.4 | 2D Slices | Matrix, slice of slices |
| 5.5 | Maps | `make`, CRUD, existence check, `delete` |
| 5.6 | Sorting | `sort.Slice`, `sort.Ints`, `sort.Strings`, custom sort |

---

### Topik 6 — Structs & Methods (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 6.1 | Struct dasar | Definition, instantiation, field access |
| 6.2 | Methods | Value receiver vs pointer receiver, method set |
| 6.3 | Struct embedding | Anonymous fields, promoted methods |
| 6.4 | Constructor pattern | Factory functions, option structs |
| 6.5 | Struct tags & JSON | `json:"..."`, `omitempty`, marshal/unmarshal |

---

### Topik 7 — Interfaces (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 7.1 | Interface dasar | Definition, implicit implementation, duck typing |
| 7.2 | Interface composition | Embedding interfaces, io.ReadWriter |
| 7.3 | Empty interface | `any` / `interface{}`, use cases, tradeoffs |
| 7.4 | Type assertion & switch | Safe assertion, comma-ok, type switch |
| 7.5 | Stdlib interfaces | `io.Reader`, `io.Writer`, `fmt.Stringer`, `error` |

---

### Topik 8 — Pointers (4 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 8.1 | Pointer basics | `&` address-of, `*` dereference, `new()` |
| 8.2 | Value vs pointer semantics | Stack vs heap, mutation, performance |
| 8.3 | Pointers ke struct | Method receivers, field mutation |
| 8.4 | Nil pointer | Zero value pointer, nil checks, safe access |

---

### Topik 9 — Error Handling (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 9.1 | error interface | `errors.New`, returning errors, checking nil |
| 9.2 | fmt.Errorf & wrapping | `%w` verb, wrapped error chain |
| 9.3 | errors.Is & errors.As | Unwrapping chain, target matching |
| 9.4 | Custom error types | Struct errors, adding context/fields |
| 9.5 | Best practices | Sentinel errors, panic vs error, opaque errors |

---

### Topik 10 — Goroutines & Channels (6 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 10.1 | Goroutines | `go` keyword, scheduler, concurrency vs parallelism |
| 10.2 | Channels unbuffered | Make channel, send, receive, blocking behavior |
| 10.3 | Buffered channels | Capacity, non-blocking send, `len` / `cap` |
| 10.4 | select statement | Multi-channel wait, default case, timeout pattern |
| 10.5 | sync.WaitGroup | `Add`, `Done`, `Wait`, fan-out pattern |
| 10.6 | sync.Mutex | Critical section, `Lock`/`Unlock`, `-race` flag |

---

### Topik 11 — Packages & Modules (4 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 11.1 | Membuat package | Package naming, file organization, init() |
| 11.2 | Exported vs unexported | Capitalization rules, API design |
| 11.3 | Import & alias | Import path, dot import, blank import, alias |
| 11.4 | go get & versioning | `go get`, SemVer, `require`, `replace` directive |

---

### Topik 12 — File I/O & OS (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 12.1 | Baca & tulis file | `os.ReadFile`, `os.WriteFile`, `bufio.Scanner` |
| 12.2 | io.Reader & io.Writer | Stream pattern, `io.Copy`, `bytes.Buffer` |
| 12.3 | JSON encoding | `json.Marshal`, `json.Unmarshal`, streaming |
| 12.4 | Environment & args | `os.Getenv`, `os.Args`, `flag` package |
| 12.5 | Paths & directories | `filepath.Join`, `os.Mkdir`, `os.ReadDir`, walk |

---

### Topik 13 — Testing in Go (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 13.1 | Unit testing | `testing.T`, `t.Error`, `t.Fatal`, `go test` |
| 13.2 | Table-driven tests | Subtests, `t.Run`, test cases slice |
| 13.3 | Test helpers | `t.Helper()`, setup/teardown, `TestMain` |
| 13.4 | Benchmarks | `testing.B`, `b.N`, `go test -bench` |
| 13.5 | Mocking | Interface-based mocks, test doubles, fakes |

---

### Topik 14 — HTTP & Web (6 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 14.1 | HTTP server | `net/http`, `ListenAndServe`, `HandleFunc` |
| 14.2 | Request & Response | Parse body, headers, query params, write response |
| 14.3 | Routing & middleware | Custom mux, middleware chain, handler pattern |
| 14.4 | HTTP client | `http.Get`, `http.Post`, custom client, timeout |
| 14.5 | JSON REST API | Mini CRUD API project — end-to-end |
| 14.6 | Middleware patterns | Logging, auth, CORS, recovery middleware |

---

### Topik 15 — Go Patterns & Best Practices (5 lessons)

| # | Lesson | Deskripsi |
|---|---|---|
| 15.1 | context.Context | Timeout, cancellation, value passing, propagation |
| 15.2 | Functional options | Options pattern, WithXxx functions |
| 15.3 | Worker pool | Bounded concurrency, job/result channels |
| 15.4 | embed package | Static assets, `//go:embed`, FS interface |
| 15.5 | Project layout | Standard layout, cmd/internal/pkg, clean arch |

---

## 7. Database Schema

```sql
-- =====================
-- USERS
-- =====================
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE,
  password_hash  VARCHAR(255),
  provider       VARCHAR(50) DEFAULT 'local',   -- 'local' | 'google' | 'github'
  provider_id    VARCHAR(255),
  name           VARCHAR(255) NOT NULL,
  avatar_url     TEXT,
  lang_pref      VARCHAR(5) DEFAULT 'id',        -- 'id' | 'en'
  xp             INT DEFAULT 0,
  streak_days    INT DEFAULT 0,
  last_active    DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PROGRESS
-- =====================
CREATE TABLE lesson_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_slug      VARCHAR(100) NOT NULL,
  lesson_id       VARCHAR(100) NOT NULL,
  completed       BOOLEAN DEFAULT FALSE,
  last_code       TEXT,
  best_quiz_score INT,
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, topic_slug, lesson_id)
);

-- =====================
-- GAMIFICATION
-- =====================
CREATE TABLE badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(100) UNIQUE NOT NULL,
  name_id        VARCHAR(255),
  name_en        VARCHAR(255),
  description_id TEXT,
  description_en TEXT,
  icon           VARCHAR(100)
);

CREATE TABLE user_badges (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_slug     VARCHAR(100) REFERENCES badges(slug),
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_slug)
);

-- =====================
-- DISCUSSIONS
-- =====================
CREATE TABLE comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_slug     VARCHAR(100) NOT NULL,
  lesson_id      VARCHAR(100) NOT NULL,
  parent_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  upvotes        INT DEFAULT 0,
  is_pinned      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comment_upvotes (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id     UUID REFERENCES comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_topic ON lesson_progress(topic_slug);
CREATE INDEX idx_comments_lesson ON comments(topic_slug, lesson_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_users_xp ON users(xp DESC);
```

---

## 8. API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Daftar email/password |
| POST | `/api/auth/login` | — | Login, return JWT httpOnly cookie |
| POST | `/api/auth/logout` | — | Clear cookie |
| POST | `/api/auth/refresh` | — | Refresh JWT |
| GET | `/api/auth/google` | — | OAuth redirect ke Google |
| GET | `/api/auth/google/callback` | — | OAuth callback |
| GET | `/api/auth/github` | — | OAuth redirect ke GitHub |
| GET | `/api/auth/github/callback` | — | OAuth callback |
| GET | `/api/auth/me` | JWT | Profil user aktif |
| PATCH | `/api/auth/me` | JWT | Update nama, lang preference |

### Content

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/topics` | — | List semua topik + metadata |
| GET | `/api/topics/:slug` | — | Detail topik + lesson list |
| GET | `/api/topics/:slug/lessons/:id` | — | Konten lesson + quiz soal |
| GET | `/api/search?q=` | — | Full-text search lessons/topics |

### Code Executor

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/execute` | — | Jalankan Go code, 5s timeout |
| GET | `/api/playground/templates` | — | List template snippets |

### Progress & Gamification

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/progress` | JWT | Semua progress user |
| PUT | `/api/progress/:topic/:lesson` | JWT | Mark complete + simpan last code |
| POST | `/api/quiz/:lessonId/submit` | JWT | Simpan quiz score, trigger XP |
| GET | `/api/me/stats` | JWT | XP, level, streak, badge count |
| GET | `/api/badges` | JWT | Semua badge + earned status user |

### Leaderboard & Discussion

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/leaderboard?period=alltime\|month\|week` | — | Ranking XP |
| GET | `/api/discussions/:topic/:lesson` | — | List komentar threaded |
| POST | `/api/discussions` | JWT | Tambah komentar/reply |
| POST | `/api/discussions/:id/upvote` | JWT | Toggle upvote |
| DELETE | `/api/discussions/:id` | JWT | Hapus komentar sendiri |

---

## 9. GSAP Animation Map

| Lokasi | Animasi | GSAP API |
|---|---|---|
| Landing hero | Text reveal + image slide-in | `gsap.from()` + `ScrollTrigger` |
| Navbar | Hide scroll-down, show scroll-up | `ScrollTrigger` + `autoAlpha` |
| Topic card grid | Stagger fade-up on scroll | `gsap.fromTo()` + `stagger: 0.08` |
| Topic card hover | Scale-up micro | `gsap.to()` scale 1.02, duration 0.2 |
| Lesson sidebar | Checklist tick per item | `gsap.timeline()` drawSVG |
| Progress bar | Smooth width fill on complete | `gsap.to()` width % |
| XP counter | Number count-up saat XP naik | `gsap.to()` + `snap: 1` |
| Level-up modal | Scale-in + burst celebrasi | `gsap.timeline()` + `ease: elastic` |
| Badge earned | Bounce in | `gsap.from()` + `ease: back.out(2)` |
| Quiz benar | Green pulse | `gsap.to()` scale + opacity yoyo |
| Quiz salah | Red horizontal shake | `gsap.to()` x keyframes |
| Page transition | Fade + vertical slide | `gsap.context()` cleanup |
| Stats counter | Number reveal on scroll | `ScrollTrigger` onEnter + counter |
| Landing sections | Sequential fade-in | `gsap.from()` + `stagger` ScrollTrigger |

---

## 10. shadcn/ui Components

```
# Core Primitives
Button          — primary, secondary, ghost, destructive variants
Badge           — Beginner / Intermediate / Advanced + custom
Card            — CardHeader, CardContent, CardFooter
Separator       — hairline #D2D2D7
Skeleton        — loading placeholder
Progress        — lesson + overall progress bars
Avatar          — user avatar + initials fallback

# Form & Input
Input           — text, email, password
Textarea        — komentar, kode challenge
Label           — form labels
Form            — react-hook-form integration
Select          — dropdown (language, filter, templates)
Checkbox        — quiz options
RadioGroup      — quiz single-select
Switch          — bilingual toggle, dark mode

# Layout
ResizablePanelGroup   — lesson/editor split panel
ResizablePanel        — left content, right editor
ResizableHandle       — drag divider
ScrollArea            — sidebar, output panel, comment list
Tabs                  — leaderboard filter, module catalog
Accordion             — FAQ, topic lesson list
Collapsible           — sidebar sections

# Navigation
NavigationMenu        — main navbar
Breadcrumb            — modul > topik > lesson
Sidebar               — lesson sidebar (shadcn sidebar component)

# Overlay & Popup
Dialog                — level-up modal, confirm delete
Sheet                 — mobile sidebar drawer
Drawer                — mobile navigation
Tooltip               — icon button labels
Popover               — user quick stats
HoverCard             — badge detail preview
DropdownMenu          — user menu, options

# Feedback
Sonner (Toast)        — success, error, info notifications
Alert                 — warning banners
AlertDialog           — destructive confirm (hapus akun)

# Search
Command (cmdk)        — global Ctrl+K search palette

# Data Display
Table                 — leaderboard rankings
Recharts (shadcn chart) — dashboard progress bar chart, activity
```

---

## 11. Tasks Breakdown

### Phase 1 — Foundation (4–5 hari)

#### Repo & Infrastructure
- [ ] Restructure repo: buat `frontend/` dan `backend/`
- [ ] Pindahkan existing Go code ke `backend/cmd/examples/`
- [ ] Buat `docker-compose.yml`: frontend:3000, backend:8080, postgres:5432
- [ ] Buat `.env.example` dengan semua required vars
- [ ] Tambahkan `.gitignore` untuk node_modules, .env, binary

#### Backend Init
- [ ] `go mod init github.com/Kahfi10/go-learning/backend`
- [ ] Install: `chi`, `pgx/v5`, `golang-jwt/jwt/v5`, `golang.org/x/oauth2`, `bcrypt`, `godotenv`
- [ ] Setup Chi router + route groups (`/api/auth`, `/api/topics`, dll)
- [ ] CORS middleware
- [ ] Request logger middleware
- [ ] Database pool init (pgx)
- [ ] Health check `GET /api/health`

#### Database Migrations
- [ ] Setup migration runner (`golang-migrate` atau manual)
- [ ] Migration 001: `users` table
- [ ] Migration 002: `lesson_progress` table
- [ ] Migration 003: `badges` + `user_badges` tables
- [ ] Migration 004: `comments` + `comment_upvotes` tables
- [ ] Migration 005: indexes
- [ ] Seed: 15 badge definitions

#### Frontend Init
- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] `npx shadcn@latest init` — pilih Apple HIG custom theme
- [ ] Install shadcn components (semua dari daftar section 10)
- [ ] `npm install gsap @monaco-editor/react sonner @tanstack/react-query`
- [ ] Setup `globals.css` — Apple HIG design tokens
- [ ] Setup Inter Tight + JetBrains Mono via `next/font/google`
- [ ] Buat `lib/gsap.ts` — register ScrollTrigger, TextPlugin
- [ ] Buat `lib/api.ts` — typed fetch wrapper dengan auth header inject
- [ ] Next.js middleware untuk JWT cookie auth check + redirect

---

### Phase 2 — Auth System (3–4 hari)

#### Backend Auth
- [ ] `POST /api/auth/register` — validate, bcrypt hash, create user, return JWT + refresh
- [ ] `POST /api/auth/login` — verify password, return JWT cookie
- [ ] `POST /api/auth/logout` — clear cookie
- [ ] `POST /api/auth/refresh` — exchange refresh token
- [ ] JWT middleware (`chi.Use`) — attach user ID ke context
- [ ] Google OAuth: `GET /api/auth/google` redirect + `GET /api/auth/google/callback`
- [ ] GitHub OAuth: `GET /api/auth/github` redirect + `GET /api/auth/github/callback`
- [ ] `GET /api/auth/me` — return user profile
- [ ] `PATCH /api/auth/me` — update name, lang_pref

#### Frontend Auth (Module 1)
- [ ] Register page — shadcn Form, Input, Button, validation
- [ ] Login page — form + "Continue with Google" + "Continue with GitHub" buttons
- [ ] Auth context dengan React Context + useReducer
- [ ] JWT decode helper (`lib/auth.ts`)
- [ ] Protected route HOC
- [ ] Profile page `/profile/[username]` — avatar, XP bar, badges grid, stats
- [ ] Settings page — update name, password, lang pref, delete account (AlertDialog confirm)

---

### Phase 3 — Content Engine (4–5 hari)

#### Lesson Content Files
- [ ] Buat schema: `meta.json` per topik (slug, title ID/EN, description, level, estimatedMinutes)
- [ ] Buat schema: lesson MDX frontmatter (id, title ID/EN, starterCode, quiz array)
- [ ] Topik 1 Getting Started: 4 lesson MDX files (bilingual)
- [ ] Topik 2 Variables & Types: 5 lesson files
- [ ] Topik 3 Functions: 6 lesson files
- [ ] Topik 4 Control Structures: 5 lesson files
- [ ] Topik 5 Collections: 6 lesson files
- [ ] Topik 6 Structs & Methods: 5 lesson files
- [ ] Topik 7 Interfaces: 5 lesson files
- [ ] Topik 8 Pointers: 4 lesson files
- [ ] Topik 9 Error Handling: 5 lesson files
- [ ] Topik 10 Goroutines & Channels: 6 lesson files
- [ ] Topik 11 Packages & Modules: 4 lesson files
- [ ] Topik 12 File I/O: 5 lesson files
- [ ] Topik 13 Testing: 5 lesson files
- [ ] Topik 14 HTTP & Web: 6 lesson files
- [ ] Topik 15 Go Patterns: 5 lesson files
- [ ] Quiz soal 3–5 per lesson (target ~300 soal total)

#### Content API
- [ ] Content loader: baca MDX + JSON dari `data/content/`
- [ ] `GET /api/topics` handler
- [ ] `GET /api/topics/:slug` handler
- [ ] `GET /api/topics/:slug/lessons/:id` handler
- [ ] `GET /api/search?q=` — full-text search across lesson titles + descriptions

#### Code Executor
- [ ] `internal/executor/runner.go` — write Go source ke `/tmp/{uuid}.go`, `exec.CommandContext` 5s timeout
- [ ] Input sanitizer: blokir `os.Exit`, `syscall`, dangerous imports
- [ ] Parse stdout/stderr split
- [ ] `POST /api/execute` handler
- [ ] Response: `{ stdout, stderr, executionTimeMs, timedOut }`
- [ ] Unit test executor dengan valid + invalid + timeout cases

---

### Phase 4 — Core UI & Learning Pages (5–6 hari)

#### Design System Setup
- [ ] Override shadcn CSS variables dengan Apple HIG palette di `globals.css`
- [ ] Custom Badge variants: Beginner (green), Intermediate (blue), Advanced (purple)
- [ ] Custom `ProgressBar` komponen — thin 4px, GSAP animated fill
- [ ] Frosted glass `Navbar` — `backdrop-blur`, GSAP hide-on-scroll-down
- [ ] Mobile hamburger + Sheet drawer navigation

#### Landing Page (`/`)
- [ ] Hero: GSAP TextPlugin reveal headline, sub-headline fade-in
- [ ] Hero image/illustration parallax dengan ScrollTrigger
- [ ] Stats section: 3 counter numbers (GSAP count-up on scroll)
- [ ] "15 Topics" strip: horizontal scroll cards, GSAP stagger reveal
- [ ] Feature highlights: 3 section cards fade-in
- [ ] "Why Go?" prose section
- [ ] Final CTA section

#### Module Catalog (`/modules`)
- [ ] shadcn `Tabs`: All / Beginner / Intermediate / Advanced
- [ ] Topic card grid: 3 kolom desktop, 1 kolom mobile
- [ ] GSAP stagger on mount (`gsap.fromTo` + `stagger: 0.08`)
- [ ] Progress overlay di card (visible saat login)
- [ ] GSAP hover scale micro-animation

#### Topic Intro Page (`/modules/[topic]`)
- [ ] Hero: topik nama + deskripsi + level badge + estimasi waktu
- [ ] Lesson list dengan status icon (locked/open/complete)
- [ ] "Start" / "Continue" CTA

#### Lesson Page (`/modules/[topic]/[lesson]`)
- [ ] `ResizablePanelGroup`: prose panel (60%) + editor panel (40%)
- [ ] `LessonSidebar`: daftar lesson + checklist navigasi
- [ ] Bilingual `Switch` toggle (ID ↔ EN)
- [ ] `ProseRenderer` — MDX → styled HTML (Apple typography)
- [ ] Breadcrumb + estimated reading time
- [ ] Anchor TOC untuk lesson panjang
- [ ] "Mark as Complete" button → GSAP tick animation → trigger XP award
- [ ] Lesson Prev/Next navigation bar

#### Code Editor (Module 2)
- [ ] Monaco Editor wrapper — Go lang, dark theme `#1C1C1E`
- [ ] Toolbar: Run, Reset, Copy (shadcn Button variants)
- [ ] `Ctrl/Cmd+Enter` keyboard shortcut
- [ ] Output panel: shadcn ScrollArea, color-coded stdout (white) / stderr (red)
- [ ] Execution time badge
- [ ] Loading skeleton saat execute (shadcn Skeleton)
- [ ] Auto-save code ke localStorage key `code:{topicSlug}:{lessonId}:{userId}`

---

### Phase 5 — Quiz & Gamification (3–4 hari)

#### Quiz (Module 4)
- [ ] `Quiz.tsx` — render soal dari JSON frontmatter MDX
- [ ] shadcn `RadioGroup` untuk pilihan
- [ ] GSAP feedback: `gsap.to(el, {x: [-8,8,-8,8,0]})` shake (salah)
- [ ] GSAP feedback: `gsap.to(el, {scale: [1,1.05,1], borderColor: green})` pulse (benar)
- [ ] Per-soal progress indicator
- [ ] `QuizResult.tsx` — score card, `X/5 correct`, retry button
- [ ] Submit score: `POST /api/quiz/:lessonId/submit`
- [ ] Best score simpan ke DB, tampil di lesson sidebar

#### Gamification Backend (Module 5)
- [ ] `gamification_service.go` — `AwardXP(userID, amount, reason)`
- [ ] Streak tracker: `UpdateStreak(userID)` — cek `last_active`, increment/reset
- [ ] Badge evaluator: `CheckAndAwardBadges(userID)` — evaluasi kondisi per badge
- [ ] `GET /api/me/stats` — XP, level (kalkulasi dari XP bracket), streak, badge count
- [ ] `GET /api/badges` — semua badge + user earned status
- [ ] XP brackets: 0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000

#### Gamification Frontend
- [ ] `XPCounter.tsx` — GSAP `gsap.to({val: oldXP}, {val: newXP, snap: 1, onUpdate})` count-up
- [ ] `LevelUpModal.tsx` — shadcn Dialog + GSAP scale-in + burst animation
- [ ] `StreakBadge.tsx` — flame icon + jumlah hari
- [ ] `BadgeCard.tsx` — earned (full color) vs locked (grayscale + blur)
- [ ] Progress bar GSAP fill: `gsap.to(barEl, {width: pct + '%', duration: 0.8, ease: 'expo.out'})`

#### Progress API
- [ ] `PUT /api/progress/:topic/:lesson` — update completed, last_code, trigger AwardXP + CheckBadges
- [ ] `GET /api/progress` — return map semua lesson progress user

---

### Phase 6 — Extra Modules (4–5 hari)

#### Playground (Module 6)
- [ ] `/playground` — full-width Monaco + full-height output
- [ ] shadcn `Select` template dropdown (6 snippets)
- [ ] Run code → same executor API
- [ ] Share: `btoa(code)` → URL `?code=...`, decode on load
- [ ] "Copy Link" button → Sonner toast "Link copied!"

#### Leaderboard (Module 7)
- [ ] `GET /api/leaderboard?period=` handler — query users ORDER BY xp DESC
- [ ] `/leaderboard` page
- [ ] shadcn `Tabs`: All Time / This Month / This Week
- [ ] shadcn `Table` dengan kolom: Rank, User, Level, XP
- [ ] Top 3 rows: gold/silver/bronze crown emoji + bold styling
- [ ] Highlight logged-in user row (`bg-accent/10`)
- [ ] GSAP stagger row entrance animation
- [ ] Pagination component (top 50)

#### Discussion (Module 8)
- [ ] `GET /api/discussions/:topic/:lesson` — threaded comments
- [ ] `POST /api/discussions` — create comment/reply
- [ ] `POST /api/discussions/:id/upvote` — toggle, optimistic update di frontend
- [ ] `DELETE /api/discussions/:id` — soft delete (user own only)
- [ ] `CommentThread.tsx` — render parent + replies (max 1 level)
- [ ] `CommentForm.tsx` — shadcn Textarea + submit Button
- [ ] `CommentItem.tsx` — avatar, name, content, upvote button, reply button, time ago
- [ ] Sorting toggle: Newest / Most Upvoted

#### Dashboard (Module 9)
- [ ] `/dashboard` — protected route
- [ ] 4 overview cards: XP, Streak, Lessons Done, Current Level
- [ ] shadcn Recharts bar chart: progress per topik (% completed)
- [ ] Recent activity feed: 5 item list (lesson completed, badge earned, dll)
- [ ] "Continue Learning" card — last incomplete lesson CTA

#### Search (Module 10)
- [ ] `GET /api/search?q=` — search topics + lessons (title + description)
- [ ] shadcn `Command` dialog component
- [ ] Global `Ctrl/Cmd+K` shortcut via `useEffect` event listener
- [ ] Debounce 300ms sebelum API call
- [ ] Hasil digroup: Topics, Lessons
- [ ] Keyboard nav (↑↓ Enter Escape)
- [ ] Recent 5 searches via localStorage

---

### Phase 7 — Polish, Responsive & Testing (3–4 hari)

- [ ] Dark mode: `next-themes` provider + Apple dark tokens (`#000000` bg, `#1D1D1F` card)
- [ ] Dark mode toggle di Navbar (shadcn Switch + moon/sun icon)
- [ ] Lesson page mobile: stacked layout (prose atas, editor bawah), hide sidebar → Sheet
- [ ] Module catalog mobile: single column grid
- [ ] Monaco lazy load: `dynamic(() => import(...), { ssr: false })`
- [ ] GSAP dynamic import untuk non-critical pages
- [ ] TanStack Query: proper staleTime, cacheTime config
- [ ] shadcn Skeleton loading di semua halaman
- [ ] Error boundaries di setiap section besar
- [ ] 404 page — minimal Apple style
- [ ] E2E flow test: register → login → buka lesson → run code → quiz → XP naik → badge earned → leaderboard terupdate
- [ ] `README.md` — setup guide, `docker compose up`, env vars

---

## 12. Timeline

| Phase | Fokus | Estimasi |
|---|---|---|
| 1 | Foundation, Docker, Database | 4–5 hari |
| 2 | Auth System (Email + Google + GitHub OAuth) | 3–4 hari |
| 3 | Content MDX 76 lessons + Content API + Executor | 4–5 hari |
| 4 | Core UI + Learning Pages (Landing, Catalog, Lesson) | 5–6 hari |
| 5 | Quiz + Gamification (XP, Streak, Badges) | 3–4 hari |
| 6 | Playground + Leaderboard + Discussion + Dashboard + Search | 4–5 hari |
| 7 | Polish, Dark Mode, Responsive, Testing | 3–4 hari |
| **Total** | | **~26–33 hari kerja** |

---

## Keputusan Teknis Final

| Aspek | Keputusan |
|---|---|
| Feature modules | **10 modul fitur** |
| Kurikulum Go | **15 topik, 76 lessons** |
| Bahasa konten | **Bilingual ID/EN** (toggle di UI, preference disimpan) |
| Auth | **Email/Password + Google & GitHub OAuth** |
| Database | **PostgreSQL 15** (Docker) |
| UI Components | **shadcn/ui** (Radix UI + Tailwind) |
| Animations | **GSAP + ScrollTrigger** |
| Design referensi | **Apple HIG** — white, generous space, minimal |
| Code executor | `exec.CommandContext` + **5s timeout** |
| Backend framework | **Chi** (net/http compatible) |
| DB queries | **sqlc** + pgx/v5 |
| State management | **TanStack Query v5** |

---

*GoLearn PRD — Last updated: 2026-07-28*
