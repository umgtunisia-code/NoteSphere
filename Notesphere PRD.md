---

markdown  
\# Product Requirements Document (PRD) – NoteSphere

\*\*Product Name\*\*: Synapse    
\*\*Tagline\*\*: Connect your ideas, control your time.    
\*\*Version\*\*: 1.0 (Minimum Viable Product – MVP)    
\*\*Date\*\*: December 12, 2025    
\*\*Author\*\*: MAKREM    
\*\*Status\*\*: Approved for Development  

\---

\#\# 1\. Goal & Success Metrics

\#\#\# 1.1 Product Goal  
To provide professionals, students, and project managers with a single, integrated web application that seamlessly connects \*\*notes\*\*, \*\*tasks\*\*, \*\*reminders\*\*, and \*\*calendar events\*\*, eliminating the need for fragmented tools and facilitating streamlined, project-centric workflow management.

\#\#\# 1.2 Target Audience  
\- \*\*Primary\*\*: Individuals managing multiple simultaneous personal and professional projects (e.g., students, freelancers, solopreneurs, knowledge workers).    
\- \*\*Secondary\*\*: Micro-teams (1–3 people) needing lightweight shared visibility (post-MVP consideration).

\#\#\# 1.3 Key Success Metrics (KPIs – Q1 Post-Launch)  
| Metric | Target |  
|-------|--------|  
| \*\*User Engagement\*\* | Avg. 3 projects and 15 tasks created per active user/month |  
| \*\*Retention\*\* | 30% Month-over-Month (MoM) retention for onboarded users |  
| \*\*Feature Adoption\*\* | 70% of active users use “Convert Note to Task” at least once |  
| \*\*Task-to-Calendar Sync Accuracy\*\* | 100% of tasks with due dates appear on calendar |  
| \*\*Drag-and-Drop Reschedule Success Rate\*\* | ≥ 95% success (no data loss or UI desync) |

\---

\#\# 2\. Technical Stack & Infrastructure

| Component | Technology | Rationale |  
|---------|-----------|----------|  
| \*\*Frontend / Backend\*\* | Next.js 14 (App Router) \+ TypeScript | Full-stack React framework; ideal for Vercel, SSR, and API routes |  
| \*\*Styling\*\* | Tailwind CSS \+ shadcn/ui | Rapid, consistent, accessible UI development |  
| \*\*Rich Text Editor\*\* | Tiptap | Headless, extensible, outputs clean JSON |  
| \*\*Calendar UI\*\* | FullCalendar (React) | Industry-standard, supports drag-and-drop, multiple views |  
| \*\*Database\*\* | Neon.tech (PostgreSQL 16\) | Serverless Postgres with branching, autoscaling, and low latency |  
| \*\*Authentication\*\* | Clerk | Secure, compliant, and fast to integrate (social \+ email/password) |  
| \*\*Deployment\*\* | Vercel | Zero-config CI/CD with GitHub; edge functions, instant cache |  
| \*\*Source Control\*\* | GitHub | Standard for collaboration, PR reviews, and issue tracking |

\---

\#\# 3\. Core Features & Functional Requirements

\#\#\# 3.1 Authentication (Clerk)

| ID | Requirement | Description | Acceptance Criteria |  
|----|------------|------------|---------------------|  
| \*\*F-AUTH-1\*\* | User Sign-up/Login | Support Google, GitHub, and email/password login via Clerk. | Users can register, log in, and log out securely using embedded Clerk components. |  
| \*\*F-AUTH-2\*\* | User Profile | Allow users to view/edit name and email. | Profile updates are persisted in Clerk and reflected in-app immediately. |

\> \*\*Note\*\*: New users are auto-assigned a default “Personal” Project on first login.

\---

\#\#\# 3.2 Data Modeling (Neon/PostgreSQL)

The system revolves around three core entities with strict referential integrity:

\- \*\*User\*\* → has many \*\*Projects\*\*    
\- \*\*Project\*\* → has many \*\*Notes\*\* and \*\*Tasks\*\*    
\- \*\*Task\*\* → belongs to one \*\*Project\*\*, optionally linked to one \*\*Note\*\*

\#\#\#\# Schema (Simplified)  
\`\`\`sql  
\-- Users (managed by Clerk; only ID stored)  
CREATE TABLE users (id TEXT PRIMARY KEY);

\-- Projects  
CREATE TABLE projects (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id TEXT NOT NULL REFERENCES users(id),  
  name TEXT NOT NULL,  
  color TEXT DEFAULT '\#3B82F6', \-- for UI color-coding  
  is\_archived BOOLEAN DEFAULT false,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Notes  
CREATE TABLE notes (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  project\_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,  
  title TEXT,  
  content JSONB, \-- Tiptap output  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Tasks  
CREATE TABLE tasks (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id TEXT NOT NULL REFERENCES users(id),  
  project\_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,  
  note\_id UUID REFERENCES notes(id) ON DELETE SET NULL,  
  title TEXT NOT NULL,  
  description TEXT,  
  due\_at TIMESTAMPTZ NOT NULL,  
  reminder\_offset\_minutes INTEGER,  
  is\_completed BOOLEAN DEFAULT false,  
  is\_recurring BOOLEAN DEFAULT false,  
  recurrence\_rule TEXT,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

Indexes: On (user\_id), (project\_id), (due\_at) for performance.  
---

### **3.3 Project Management**

| ID | Requirement | Description | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| F-PRO-1 | Project Creation | Users can create a Project with name, optional description, and color. | New projects appear in the Project List and can be linked to Notes/Tasks. |
| F-PRO-2 | Project Status Tracking | Show completion % (e.g., “3/10 Tasks Completed”). | Status updates in real time when tasks are marked complete/incomplete. |
| F-PRO-3 | Project Detail View | Dedicated page showing all Notes and Tasks for a Project. | Tabs for “Notes” and “Tasks”; progress bar visible at top. |

---

### **3.4 Notes & Tasks Integration**

| ID | Requirement | Description | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| F-NOTE-1 | Rich Text Note Editor | Support bold, italics, lists, headings via Tiptap. | Formatting is saved in content (JSONB) and rendered correctly on view. |
| F-NOTE-2 | Note-to-Task Conversion | Highlight text → click button → create task. | Task modal opens with title pre-filled; auto-linked to current Project and Note. |
| F-TASK-1 | Task Creation | Must include: Name, Description, Due Date/Time, Project (required), optional Reminder. | Task appears instantly in Tasks View and Calendar View. |
| F-TASK-2 | Task Status | Toggle between “Active” and “Complete”. | Completed tasks are visually strikethrough and excluded from “active” filters; update project progress. |

Standalone Tasks: Users can create tasks outside a note (e.g., “Pay electricity bill”)—assigned to “Personal” or selected project.  
---

### **3.5 Calendar & Reminders**

| ID | Requirement | Description | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| F-CAL-1 | Calendar View | Monthly/Weekly/Daily views showing all Tasks with due dates. | Tasks rendered as color-coded events (color \= Project color). |
| F-CAL-2 | Drag-and-Drop Reschedule | Click and drag a task to a new date/time. | Due date in DB is updated; UI reflects change instantly (optimistic update). |
| F-CAL-3 | Reminder Notifications | In-app toast when a task’s reminder time arrives. | Notification shows task title \+ project; dismissible; respects browser tab focus. |

Note: Reminders are client-side only in MVP (no background workers or email/SMS).  
---

## **4\. User Interface (UI) & Experience (UX)**

* Design Philosophy: Minimalist, focused, zero clutter.  
* Navigation:  
  1. Left Sidebar: Persistent nav with: Dashboard, Notes, Tasks, Calendar  
  2. Project List: Collapsible, sorted by last updated  
* Color-Coding: Every Project has a user-selectable accent color used consistently across Notes, Tasks, and Calendar events.  
* Responsiveness:  
  1. Fully functional on desktop and tablet (≥768px)  
  2. Mobile is out of scope for MVP (responsive fallback only)  
* Key Views:  
  1. Dashboard: Project list \+ “Tasks Due Today” summary cards \+ Quick Task input  
  2. Notes View: Filter by project \+ rich editor \+ “Convert to Task” button  
  3. Tasks View: Filter presets \+ project grouping \+ task detail pane  
  4. Calendar View: FullCalendar with drag-and-drop  
  5. Project Detail: Tabs for Notes/Tasks \+ progress bar

---

## **5\. Future Considerations (Post-MVP)**

These are explicitly excluded from MVP scope.

* 📱 Mobile Apps (iOS/Android via React Native or Capacitor)  
* 👥 Team Collaboration: Shared projects, task assignment, comments  
* 🔗 External Calendar Sync: Bi-directional Google Calendar / Outlook integration  
* 🖼️ Rich Media in Notes: Image upload, file embedding  
* 🔁 Advanced Recurring Tasks: Complex rules (e.g., “every 2 weeks on Tuesday”)  
* 📊 Analytics Dashboard: Time tracking, productivity insights

---

## **6\. Development & Testing**

### **6.1 Development Workflow**

1. Create feature branch: feature/note-to-task  
2. Implement frontend \+ server actions \+ DB schema (if needed)  
3. Open PR on GitHub with description \+ screenshots  
4. Peer review → merge to main  
5. Vercel auto-deploys main to production  
6. Neon Branching: Use project branches for schema testing (e.g., synapse-makrem/note-task-feature)

### **6.2 Testing Strategy**

* Manual QA: Verify all Acceptance Criteria in staging (Vercel preview)  
* Critical Paths to Test:  
  * Note → Task → Calendar → Reschedule → Back to Note (full loop)  
  * Project deletion → cascading note/task cleanup  
  * Auth state persistence across views  
* Automated Tests (Post-MVP):  
  * Jest for utility functions  
  * Playwright for core user flows

### **6.3 Environment Variables (Vercel)**

env  
NEXT\_PUBLIC\_CLERK\_PUBLISHABLE\_KEY=...  
CLERK\_SECRET\_KEY=...  
DATABASE\_URL=postgresql://... (Neon)  
---

## **7\. Appendix**

### **7.1 MVP Launch Timeline (Estimate)**

| Week | Focus |
| ----- | ----- |
| 1 | Auth \+ Project CRUD \+ Neon DB setup |
| 2 | Notes Editor \+ Note-to-Task flow |
| 3 | Task CRUD \+ Project Status Logic |
| 4 | Calendar Integration \+ Drag-and-Drop |
| 5 | Dashboard \+ Responsive Polish \+ QA |
| 6 | MVP Launch |

### **7.2 Open Risks**

| Risk | Mitigation |
| ----- | ----- |
| Calendar drag performance on low-end devices | Use FullCalendar’s built-in optimizations; disable animations if needed |
| Data loss during optimistic updates | Implement error rollback UI; log failures via Sentry (post-MVP) |
| Neon cold starts on first query | Warm-up script or accept slight delay for first load |

---

“Synapse isn’t another to-do list—it’s where your thinking becomes doing.”  
---

