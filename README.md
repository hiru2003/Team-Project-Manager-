# Team Project Manager (NexusFlow)

A premium, role-based project management platform designed for enterprise team collaboration. Features a unified workspace architecture, task delegation, and advanced analytics.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Authentication
- **Database**: MongoDB Atlas

## Enterprise Architecture

NexusFlow has evolved from personal silos to a **Unified Team Workspace** model. All members of the organization now operate within a single shared environment, ensuring absolute transparency and seamless task delegation.

### Role System
- **Admin**: Full workspace oversight. Can create projects, assign tasks to any member, and view global analytics.
- **Member**: Focused execution. Automatically joined to the team workspace; sees only tasks specifically assigned to them.

## Key Features

- **Personalized Dashboards**:
  - **Admins** see global task distribution and workspace-wide trends.
  - **Members** see personal progress metrics and an immediate list of "Your Assigned Tasks".
- **Kanban-Style Task Tracking**: Manage task lifecycle through `To Do`, `In Progress`, and `Done` states.
- **Collaborative Task Assignment**: Admins can assign tasks to any registered team member via a centralized directory.
- **My Tasks View**: A dedicated, role-specific page for members to manage their individual workload.
- **Enterprise Reporting**: Export detailed JSON reports for workspace auditing and progress tracking.

## Repository Structure

```text
Team-Project-Manager-/
├── frontend/                 # React + TypeScript client
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Projects, ProjectView, MyTasks
│   │   ├── context/          # Auth context + role management
│   │   └── components/       # Premium UI components & Protected routes
│   └── vite.config.ts        # Proxy configuration
└── backend/                  # Node.js + Express API
    ├── controllers/          # Business logic handlers
    ├── models/               # Mongoose schemas (User, Task, Project, Workspace)
    ├── routes/               # API route definitions
    ├── scripts/              # Migration & maintenance utilities
    └── server.js             # API entry point
```

## Quick Start

### 1) Initialize Environment

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Database & Auth Configuration

Create `backend/.env`:
```env
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3) Workspace Setup

Run the following scripts in `backend/` to initialize your environment:

- **Seed Admin**: Create the primary administrator account and workspace.
  ```bash
  node seed.js
  ```
- **Unify Data**: Merge any legacy project silos into the master team workspace.
  ```bash
  node scripts/unifyWorkspaces.js
  ```
- **Sync Members**: Ensure all registered users have access to the shared workspace.
  ```bash
  node scripts/syncUsers.js
  ```

### 4) Run Servers

**Backend**: `npm run dev` (Port 4000)
**Frontend**: `npm run dev` (Port 5173)

---
*Built for professional teams.*
