# NoteSphere (Synapse) Project Context

## Project Overview

**Product Name**: Synapse  
**Tagline**: Connect your ideas, control your time.  
**Description**: A single, integrated web application that seamlessly connects notes, tasks, reminders, and calendar events, eliminating the need for fragmented tools and facilitating streamlined, project-centric workflow management.

**Target Audience**: 
- Primary: Individuals managing multiple simultaneous personal and professional projects (e.g., students, freelancers, solopreneurs, knowledge workers)
- Secondary: Micro-teams (1–3 people) needing lightweight shared visibility (post-MVP consideration)

## Technical Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend/Backend** | Next.js 14 (App Router) + TypeScript | Full-stack React framework for Vercel deployment with SSR and API routes |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, consistent, accessible UI development |
| **Rich Text Editor** | Tiptap | Headless, extensible editor that outputs clean JSON |
| **Calendar UI** | FullCalendar (React) | Industry-standard calendar with drag-and-drop support |
| **Database** | Neon.tech (PostgreSQL 16) | Serverless PostgreSQL with branching, autoscaling, and low latency |
| **Authentication** | Clerk | Secure, compliant authentication with social and email/password options |
| **Deployment** | Vercel | Zero-config CI/CD with GitHub integration |
| **Source Control** | GitHub | Standard for collaboration, PR reviews, and issue tracking |

## Core Architecture

The system is built around three core entities with strict referential integrity:

- **User** → has many **Projects**
- **Project** → has many **Notes** and **Tasks**  
- **Task** → belongs to one **Project**, optionally linked to one **Note**

### Database Schema (Simplified)
```sql
-- Users (managed by Clerk; only ID stored)
CREATE TABLE users (id TEXT PRIMARY KEY);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- for UI color-coding
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  content JSONB, -- Tiptap output
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  reminder_offset_minutes INTEGER,
  is_completed BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Core Features

### 1. Authentication (Clerk)
- User Sign-up/Login with Google, GitHub, and email/password
- User Profile management (view/edit name and email)
- New users are auto-assigned a default "Personal" Project on first login

### 2. Project Management
- Project Creation with name, optional description, and color
- Project Status Tracking showing completion percentage
- Project Detail View with tabs for Notes and Tasks

### 3. Notes & Tasks Integration
- Rich Text Note Editor supporting bold, italics, lists, headings via Tiptap
- Note-to-Task Conversion allowing text selection and task creation
- Task Creation with Name, Description, Due Date/Time, Project (required), optional Reminder
- Task Status toggling between "Active" and "Complete"

### 4. Calendar & Reminders
- Monthly/Weekly/Daily Calendar Views showing all Tasks with due dates
- Drag-and-Drop Rescheduling of tasks
- In-app Toast Reminder Notifications when a task's reminder time arrives (client-side only in MVP)

## User Interface (UI) & Experience (UX)

- **Design Philosophy**: Minimalist, focused, zero clutter
- **Navigation**: Left sidebar with persistent navigation (Dashboard, Notes, Tasks, Calendar)
- **Color-Coding**: Each Project has a user-selectable accent color used consistently across Notes, Tasks, and Calendar events
- **Responsiveness**: Desktop and tablet support (≥768px); mobile is out of scope for MVP
- **Key Views**: Dashboard, Notes View, Tasks View, Calendar View, Project Detail View

## Success Metrics (KPIs)

- **User Engagement**: Avg. 3 projects and 15 tasks created per active user/month
- **Retention**: 30% Month-over-Month (MoM) retention for onboarded users
- **Feature Adoption**: 70% of active users use "Convert Note to Task" at least once
- **Task-to-Calendar Sync Accuracy**: 100% of tasks with due dates appear on calendar
- **Drag-and-Drop Reschedule Success Rate**: ≥ 95% success rate

## Development Workflow

1. Create feature branch: `feature/note-to-task`
2. Implement frontend + server actions + DB schema (if needed)
3. Open PR on GitHub with description + screenshots
4. Peer review → merge to main
5. Vercel auto-deploys main to production
6. Neon Branching: Use project branches for schema testing

## Environment Variables (Vercel)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=postgresql://... (Neon)
```

## MVP Timeline

1. Week 1: Auth + Project CRUD + Neon DB setup
2. Week 2: Notes Editor + Note-to-Task flow
3. Week 3: Task CRUD + Project Status Logic
4. Week 4: Calendar Integration + Drag-and-drop
5. Week 5: Dashboard + Responsive Polish + QA
6. Week 6: MVP Launch

## Key Principles

"Synapse isn't another to-do list—it's where your thinking becomes doing."