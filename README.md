# Team Project Manager (NexusFlow)

A full-stack team collaboration app for managing workspaces, projects, and tasks with role-aware views, analytics, and report export.

## Tech Stack

- Frontend: React, TypeScript, Vite, Axios, React Router, Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, Nodemailer
- Database: MongoDB

## Repository Structure

```text
Team-Project-Manager-/
├── frontend/                 # React + TypeScript client
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Projects, ProjectView
│   │   ├── context/          # Auth context + token management
│   │   └── components/       # Route protection and shared UI pieces
│   └── vite.config.ts        # /api proxy to backend
└── backend/                  # Express API server
    ├── controllers/          # Route handlers (auth, tasks, projects, etc.)
    ├── routes/               # API route definitions
    ├── models/               # Mongoose schemas
    ├── middleware/           # Auth and authorization middleware
    └── server.js             # Backend entry point
```

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB (local or Atlas)

## Quick Start

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend environment

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/team-manager
JWT_SECRET=replace-with-a-secure-random-secret
NODE_ENV=development

# Optional email verification (Nodemailer)
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USER=
MAILTRAP_PASS=
```

### 3) Start backend

```bash
cd backend
npm run dev
```

### 4) Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on Vite default (usually `http://localhost:5173`) and proxies `/api/*` to `http://localhost:4000`.

## Available Scripts

### Backend (`backend/package.json`)

- `npm run dev` - start API with nodemon
- `npm run start` - start API with node

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## Key Features

- Authentication (register, login, JWT sessions)
- Shared workspace onboarding flow
- Project creation and status management
- Kanban-style task tracking (`To Do`, `In Progress`, `Done`)
- Role-aware task visibility (member sees assigned tasks)
- Dashboard analytics (task/project summaries and charts)
- JSON report generation by workspace

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify/:token`

### Workspaces

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/:workspaceId/members`

### Projects

- `POST /api/projects`
- `GET /api/projects/:workspaceId`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks/:workspaceId?projectId=<projectId>`
- `PUT /api/tasks/:id`

### Analytics & Reports

- `GET /api/analytics/:workspaceId`
- `GET /api/reports/:workspaceId`

## Authentication Flow

- Login returns a JWT token.
- Frontend stores the authenticated user in `localStorage`.
- Axios default `Authorization: Bearer <token>` header is set via `AuthContext`.
- Backend validates token in `protect` middleware and attaches `req.user`.

## Notes

- Frontend and backend ports must match proxy expectations (`frontend/vite.config.ts` points to port `4000`).
- Project currently has no formal test suite configured.
- For production, ensure secrets are not committed and are managed via secure environment configuration.

## Future Improvements

- Add unit/integration tests for controllers and key frontend pages
- Add CI pipeline (lint, type-check, tests)
- Improve authorization checks around workspace membership boundaries
- Add Docker setup for consistent local development
