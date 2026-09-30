# StudyHub AI

An AI-powered Learning Management System built with React, JavaScript (JSX), Node.js, Express, and MySQL — with Google Gemini powering five AI study tools.

Teachers upload study material, create assignments and quizzes, and track student performance. Students browse notes, submit work, take quizzes, and use AI tools to summarize material, chat with their notes, and get help with doubts.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding Demo Data](#seeding-demo-data)
- [Deployment Guide](#deployment-guide)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## Features

### Roles
- **Admin** — manage teachers and students, platform-wide announcements, basic settings
- **Teacher** — subjects, notes, assignments, quizzes, grading, student analytics
- **Student** — browse subjects, notes, bookmarks, submit assignments, take quizzes, AI tools

### Core
- JWT authentication with email verification, forgot/reset password, role-based authorization
- Subjects with enrollment management
- Notes with Cloudinary-backed uploads (PDF/DOCX/PPTX/images), bookmarking, view counts
- Assignments with file submission, rubric upload, teacher grading
- Quizzes with MCQ / True-False / Short / Long questions, auto-grading for objective questions
- Announcements (platform-wide or per-subject), notifications, global search
- Role-specific dashboards with charts (Recharts) and performance analytics
- Dark mode, fully responsive layout

### AI Features (Google Gemini)
1. **AI Notes Summarizer** — summary, key concepts, definitions, formulas, exam tips
2. **AI Quiz Generator** — drafts MCQ/True-False/Short/Long questions from a note; teacher reviews and edits before saving
3. **AI Chat With Notes** — ask questions about a specific note, with source references and suggested follow-ups
4. **AI Doubt Solver** — simple + detailed explanations, examples, related topics
5. **AI Assignment Checker** — grammar score, content score, suggestions, and overall feedback against a rubric

The AI integration is provider-agnostic: `backend/src/services/ai/aiService.js` is the only file the rest of the app talks to. Swapping Gemini for another provider later means writing a new file with the same shape and changing two `require()` lines — nothing else changes.

---

## Tech Stack

**Frontend:** React 18 (JavaScript/JSX), Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Lucide Icons, Framer Motion, React Hot Toast, Recharts, React Markdown

**Backend:** Node.js, Express, MySQL (mysql2), JWT, bcrypt, Multer + Cloudinary, Nodemailer, Helmet, express-rate-limit, express-validator

**AI:** Google Gemini API (`@google/generative-ai`)

---

## Project Structure

```
studyhub-ai/
├── backend/
│   ├── database/
│   │   ├── studyhub_ai.sql     # Full MySQL schema (idempotent, run by init-db)
│   │   ├── initDb.js           # `npm run init-db` - creates DB + demo accounts
│   │   ├── schema.sql          # Same schema, plain (non-idempotent) version
│   │   └── seed.js             # `npm run seed` - richer optional demo data
│   ├── src/
│   │   ├── config/             # db, cloudinary, mailer, gemini
│   │   ├── controllers/        # request handlers
│   │   ├── middleware/         # auth, roleGuard, errorHandler, rateLimiter, upload, validate
│   │   ├── models/             # raw SQL query modules
│   │   ├── routes/             # Express routers
│   │   ├── services/
│   │   │   ├── ai/             # geminiService.js + aiService.js (provider-agnostic facade)
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── utils/               # apiResponse, asyncHandler, ApiError, tokenUtils, fileTextExtractor
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # PageHeader, ComingSoonPage
│   │   │   ├── layout/          # Sidebar, Topbar, DashboardLayout, GlobalSearch, NotificationBell
│   │   │   └── ui/               # Button, Input, Card, Modal, Table, Skeleton, States, Badge
│   │   ├── contexts/             # AuthContext, ThemeContext
│   │   ├── features/
│   │   │   ├── auth/ dashboard/ subjects/ notes/ assignments/ quizzes/ ai/ profile/ admin/ announcements/
│   │   ├── hooks/
│   │   ├── routes/               # ProtectedRoute, NotFoundPage
│   │   ├── services/             # one file per API resource (axios wrappers)
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- A free [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)
- A free [Cloudinary](https://cloudinary.com/) account (for file uploads)
- An SMTP account for sending emails (Gmail App Password works for local dev)

### 1. Clone and install

```bash
cd studyhub-ai/backend
npm install

cd ../frontend
npm install
```

### 2. Set up the database

**Option A — automatic (recommended):**

```bash
cd backend
cp .env.example .env
# edit .env with your MySQL credentials first

npm run init-db
```

This creates the `studyhub_ai` database, every table (safe to re-run — it
never drops or overwrites data), and three ready-to-use demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@studyhub.com` | `Admin@123` |
| Teacher | `teacher@studyhub.com` | `Teacher@123` |
| Student | `student@studyhub.com` | `Student@123` |

**Option B — manual:**

```bash
mysql -u root -p < backend/database/studyhub_ai.sql
```

### 3. Configure environment variables

```bash
cd frontend
cp .env.example .env
# defaults to http://localhost:5000/api - adjust if needed
```

(You already created `backend/.env` in step 2 above.)

See [Environment Variables](#environment-variables) below for details on each value.

### 4. (Optional) Seed richer demo data

```bash
cd backend
npm run seed
```

This adds extra demo teachers/students and pre-populated subjects on top
of the three accounts `init-db` already created — see [Seeding Demo Data](#seeding-demo-data).

### 5. Run the app

```bash
# Terminal 1 - backend
cd backend
npm run dev      # starts on http://localhost:5000

# Terminal 2 - frontend
cd frontend
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser and log in with any of the demo accounts above.

---

## Environment Variables

### backend/.env

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL, used for CORS and email links |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for file uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | Outgoing email for verification/reset links |
| `GEMINI_API_KEY` | Your Google AI Studio API key |
| `GEMINI_MODEL` | Gemini model name (default `gemini-1.5-flash`, free-tier friendly) |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | General API rate limiting |

### frontend/.env

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5000/api`) |

---

## Seeding Demo Data

**`npm run init-db`** (from `backend/`) is the primary setup command — it creates the database, every table, and three demo accounts (admin/teacher/student, see the table above) with bcrypt-hashed passwords. It's idempotent: safe to run again any time, it will never overwrite existing data or duplicate accounts.

**`npm run seed`** (optional, run after `init-db`) adds a richer demo dataset on top: 2 teachers, 3 students, and 3 subjects with all students enrolled, so subject/enrollment features have something to show immediately.

Notes, assignments, and quizzes aren't seeded by either script since they need real uploaded files — log in as a teacher and create them through the UI to try the AI features end-to-end.

---

## Deployment Guide

### Database — Railway MySQL (or any managed MySQL)
1. Create a MySQL instance and note its host/port/user/password/database.
2. Point `backend/.env` at it and run `npm run init-db` locally (or run `backend/database/studyhub_ai.sql` directly against it via a GUI client) to create the schema and demo accounts.

### Backend — Render
1. Push this repo to GitHub.
2. Create a new **Web Service** on Render, pointing at the `backend/` directory.
3. Build command: `npm install` — Start command: `npm start`
4. Add all variables from `backend/.env.example` in Render's Environment tab, pointing `DB_*` at your managed MySQL and `CLIENT_URL` at your deployed frontend URL.
5. Deploy — Render gives you a public API URL.

### Frontend — Vercel
1. Import the repo into Vercel, set the root directory to `frontend/`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add `VITE_API_URL` pointing at your Render backend URL (e.g. `https://your-api.onrender.com/api`).
4. Deploy.

### Post-deploy checklist
- Update `CLIENT_URL` on the backend to match your final Vercel URL (needed for CORS and email links).
- Confirm Cloudinary, SMTP, and Gemini credentials are set on the backend host, not the frontend.
- Re-run the seed script against production only if you want demo accounts there — otherwise register real accounts through the UI.

---

## Screenshots

_Add screenshots of the dashboard, subject page, quiz builder, and AI tools here before sharing your portfolio link._

- `docs/screenshots/dashboard.png`
- `docs/screenshots/quiz-builder.png`
- `docs/screenshots/ai-summarizer.png`

---

## Future Improvements

- Real-time notifications via WebSockets instead of polling
- Video/audio note uploads with AI transcription
- Peer discussion threads per subject
- Calendar view for assignments/quizzes across all subjects
- Exportable analytics reports (PDF/CSV) for teachers
- OCR support so the AI tools can read scanned/handwritten notes
- Automated tests (Jest/Supertest for the API, Vitest/RTL for the frontend)

---

## License

This project was built as a portfolio/learning project and is free to use as a reference or starting point.
