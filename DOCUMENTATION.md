# Arbeit Platform — Comprehensive Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Installation & Setup](#4-installation--setup)
5. [Environment Variables](#5-environment-variables)
6. [User Roles & Authentication](#6-user-roles--authentication)
7. [Business Workflow](#7-business-workflow)
8. [Public Website & Job Board](#8-public-website--job-board)
9. [Admin CMS Panel](#9-admin-cms-panel)
10. [Talent Portal — Recruiter](#10-talent-portal--recruiter)
11. [Talent Portal — Client](#11-talent-portal--client)
12. [Talent Portal — Candidate](#12-talent-portal--candidate)
13. [AI Features](#13-ai-features)
14. [Interview Scheduling](#14-interview-scheduling)
15. [Screening Pipeline](#15-screening-pipeline)
16. [RBAC & Permissions](#16-rbac--permissions)
17. [Database Schema](#17-database-schema)
18. [API Reference](#18-api-reference)
19. [Deployment](#19-deployment)

---

## 1. Overview

Arbeit is a **unified recruitment platform** that combines three products into a single Next.js codebase:

| Product | Purpose | Target Users |
|---------|---------|-------------|
| **Public Website + Job Board** | Company website with job listings | Job seekers, general public |
| **Admin CMS Panel** | Manage website content, users, jobs | Arbeit administrators |
| **Talent Portal** | End-to-end recruitment management | Recruiters, Clients, Candidates |

**Business Model:** Arbeit is a recruitment consultancy (similar to CielHR). Companies (clients) submit their hiring requirements to Arbeit. Arbeit's recruiters find, screen, and shortlist candidates using AI-powered tools, then present them to clients for approval and interview scheduling.

**Key Differentiator:** All jobs on the public job board originate from client requisitions processed through the Talent Portal — creating a single connected pipeline from client requirement to candidate placement.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **Language** | TypeScript | 5.9.3 |
| **UI** | React | 18.3.1 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Database** | SQLite (via Prisma) | — |
| **ORM** | Prisma | 5.22.0 |
| **Authentication** | NextAuth.js (JWT) | 4.24.13 |
| **AI** | OpenAI GPT-4o-mini | via `openai` SDK |
| **CV Parsing** | pdf-parse + mammoth | PDF & DOCX |
| **Icons** | Lucide React | 0.577.0 |
| **Forms** | React Hook Form + Zod | 7.71.2 / 3.25.76 |
| **Password Hashing** | bcryptjs | 3.0.3 |

**Design System:**
- Primary Accent: `#3147FF` (Arbeit Blue)
- Heading Color: `#0A102F` (Dark Navy)
- Sidebar Background: `#0A102F`
- Border Radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs

---

## 3. Project Structure

```
Arbeit_Website_with_job-portal/
├── prisma/
│   ├── schema.prisma          # Database schema (22 models)
│   ├── seed.js                # Database seed data
│   └── dev.db                 # SQLite database file
│
├── public/
│   └── uploads/
│       └── cv/{candidateId}/  # Uploaded CV files
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Providers, fonts)
│   │   ├── page.tsx           # Homepage
│   │   ├── not-found.tsx      # 404 page
│   │   │
│   │   ├── (main)/            # Public website routes
│   │   │   ├── layout.tsx     # Header + Footer layout
│   │   │   ├── jobs/          # Job board
│   │   │   ├── about/         # About page
│   │   │   ├── contact/       # Contact form
│   │   │   ├── recruitment/   # Recruitment services
│   │   │   ├── contracting/   # Contracting services
│   │   │   ├── HR-Advisory-Services/
│   │   │   ├── Payroll-Compliance-Outsourcing/
│   │   │   └── p/[slug]/      # Dynamic CMS pages
│   │   │
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── dashboard/         # Job seeker dashboard
│   │   │   ├── profile/
│   │   │   ├── applications/
│   │   │   └── saved-jobs/
│   │   │
│   │   ├── employer/          # Employer dashboard
│   │   │   ├── dashboard/
│   │   │   ├── post-job/
│   │   │   ├── manage-jobs/
│   │   │   └── applications/[id]/
│   │   │
│   │   ├── admin/             # Admin CMS panel
│   │   │   ├── users/
│   │   │   ├── jobs/
│   │   │   ├── companies/
│   │   │   ├── analytics/
│   │   │   ├── inquiries/
│   │   │   ├── content/       # CMS content editor
│   │   │   └── settings/
│   │   │
│   │   ├── talent/            # Recruiter portal
│   │   │   ├── layout.tsx     # Recruiter sidebar
│   │   │   ├── page.tsx       # Dashboard with stats
│   │   │   ├── clients/       # Client CRUD
│   │   │   ├── requisitions/  # Job requisition management
│   │   │   ├── candidates/    # Candidate pool + screening
│   │   │   ├── interviews/    # Interview scheduling
│   │   │   │
│   │   │   ├── client/        # Client user portal
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── requisitions/
│   │   │   │   ├── candidates/
│   │   │   │   └── interviews/
│   │   │   │
│   │   │   └── candidate/     # Candidate self-service portal
│   │   │       ├── layout.tsx
│   │   │       ├── applications/
│   │   │       └── interviews/
│   │   │
│   │   └── api/               # API routes (see Section 18)
│   │       ├── auth/
│   │       ├── jobs/
│   │       ├── applications/
│   │       ├── profile/
│   │       ├── contact/
│   │       ├── content/
│   │       ├── upload/
│   │       ├── employers/
│   │       ├── admin/
│   │       └── talent/
│   │           ├── ai/
│   │           ├── clients/
│   │           ├── requisitions/
│   │           ├── candidates/
│   │           ├── interviews/
│   │           ├── dashboard/
│   │           ├── notifications/
│   │           ├── upload/
│   │           ├── client/
│   │           └── candidate/
│   │
│   ├── components/
│   │   ├── jobs/              # JobCard, JobFilters, JobSearchBar
│   │   ├── layout/            # Header, Footer, LayoutShell, Providers
│   │   └── ui/                # AnimatedSection, CountUp
│   │
│   ├── hooks/
│   │   ├── useCmsContent.ts   # CMS content fetching hook
│   │   └── useScrollReveal.ts # Scroll animation hook
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── permissions.ts     # RBAC permission system
│   │   ├── audit.ts           # Audit logging helper
│   │   ├── notifications.ts   # Notification helpers
│   │   ├── utils.ts           # Common utilities
│   │   └── ai/
│   │       ├── openai.ts      # OpenAI client
│   │       ├── prompts.ts     # AI prompt templates
│   │       ├── cv-parser.ts   # CV text extraction + AI parsing
│   │       ├── jd-polisher.ts # JD polishing with AI
│   │       └── fit-scorer.ts  # Candidate-job fit scoring
│   │
│   ├── types/
│   │   └── index.ts           # Type definitions, constants, enums
│   │
│   └── middleware.ts           # Route protection & RBAC
│
├── .env                       # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 4. Installation & Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Arbeit_Website_with_job-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Section 5)

# 4. Push database schema
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. (Optional) Seed sample data
npx prisma db seed

# 7. Start development server
npm run dev
# → http://localhost:3000
```

**Available Scripts:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Push schema changes to DB |
| `npx prisma generate` | Regenerate Prisma client |

---

## 5. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Base URL (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `DATABASE_URL` | Yes | SQLite path: `file:./dev.db` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `OPENAI_API_KEY` | No* | OpenAI API key for AI features |

*Required only for AI features (CV parsing, JD polishing, fit scoring).

---

## 6. User Roles & Authentication

### Authentication
- **Provider:** NextAuth.js with JWT strategy
- **Methods:** Email/password (credentials) + Google OAuth (optional)
- **Session Duration:** 30 days
- **Password Hashing:** bcryptjs

### User Roles

| Role | Code | Access |
|------|------|--------|
| **Job Seeker** | `JOB_SEEKER` | Public site, job board, applications dashboard |
| **Employer** | `EMPLOYER` | Employer dashboard, post/manage jobs |
| **Admin** | `ADMIN` | Full access to everything (all portals) |
| **Recruiter** | `RECRUITER` | Talent Portal (recruiter view) |
| **Client User** | `CLIENT_USER` | Talent Portal (client view) — submit JDs, review candidates |
| **Candidate** | `CANDIDATE` | Talent Portal (candidate view) — track applications, book interviews |

### Route Protection (Middleware)

| Route Pattern | Allowed Roles |
|---------------|---------------|
| `/admin/*` | ADMIN |
| `/employer/*` | EMPLOYER, ADMIN |
| `/dashboard/*` | Any authenticated user |
| `/talent` (recruiter) | RECRUITER, ADMIN |
| `/talent/client/*` | CLIENT_USER, ADMIN |
| `/talent/candidate/*` | CANDIDATE, JOB_SEEKER, ADMIN |
| `/jobs`, `/about`, etc. | Public (no auth required) |

---

## 7. Business Workflow

The end-to-end recruitment workflow connects all three portals:

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Client submits raw JD                              │
│  Client Portal → /talent/client/requisitions/new            │
│  Status: PENDING_APPROVAL                                    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: AI polishes JD → Recruiter approves                │
│  Recruiter Portal → /talent/requisitions/[id]               │
│  AI: raw JD → professional HTML JD                           │
│  Status: PENDING_APPROVAL → APPROVED                         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Publish to Job Board                                │
│  Recruiter clicks "Publish" → auto-posts to Job Board        │
│  Status: APPROVED → PUBLISHED                                │
│  Creates Job listing at /jobs/[slug]                         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Candidates flow in                                  │
│  Source 1: Job Board applicants (public applications)        │
│  Source 2: Recruiter-sourced CVs (manual upload)             │
│  Both enter the SAME screening pipeline                      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: AI parses CVs → Fit Score (0-100)                   │
│  pdf-parse/mammoth extracts text                             │
│  GPT-4o-mini extracts structured data                        │
│  Fit scorer compares candidate vs requisition                │
│  PII (phone+email) redacted for client view                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Recruiter screens (3 stages)                        │
│  PIPELINE → SHORTLISTED → REJECTED                           │
│  Shortlisted candidates are "Pushed to Client"               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Client reviews (redacted CVs)                       │
│  Client Portal → /talent/client/candidates                   │
│  Only phone & email are redacted, rest visible               │
│  Client clicks Approve or Reject                             │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Interview scheduling                                │
│  Client provides up to 5 time slots                          │
│  Recruiter forwards slots to candidate                       │
│  Candidate books a slot via Candidate Portal                 │
│  Confirmation sent → Interview happens                       │
│  Feedback recorded → More rounds? → Repeat or Hire           │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Placement                                           │
│  Candidate marked as SELECTED = Placed                       │
│  Requisition marked as FILLED                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Public Website & Job Board

### Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage with hero, stats, services, industries |
| `/about` | About Arbeit |
| `/contact` | Contact inquiry form |
| `/jobs` | Job listings with search, filters, pagination |
| `/jobs/[id]` | Job detail page with apply button |
| `/recruitment` | Recruitment services page |
| `/contracting` | Contracting services page |
| `/HR-Advisory-Services` | HR Advisory page |
| `/Payroll-Compliance-Outsourcing` | Payroll & Compliance page |
| `/p/[slug]` | Dynamic CMS pages |

### Job Board Features
- Full-text search by title, skills, company
- Filter by job type, experience level, location, industry
- Sort by date, salary
- Pagination
- Save/bookmark jobs (authenticated users)
- One-click apply with resume upload

---

## 9. Admin CMS Panel

**URL:** `/admin`
**Access:** ADMIN role only

| Page | Features |
|------|----------|
| `/admin` | Dashboard with stats (users, jobs, companies, applications) |
| `/admin/users` | View, search, edit roles, manage all users |
| `/admin/jobs` | Manage all job listings, approve/reject, feature |
| `/admin/companies` | Manage employer companies, verify |
| `/admin/analytics` | Platform analytics and charts |
| `/admin/inquiries` | View contact form submissions |
| `/admin/content` | CMS editor — edit homepage sections, service pages |
| `/admin/settings` | Site-wide settings, page visibility toggles |

### CMS System
- JSON-based content stored in `SiteContent` model
- Sections: hero, stats, services, about, industries, testimonials
- Toggle page/section visibility
- Custom page builder via `/p/[slug]` routes

---

## 10. Talent Portal — Recruiter

**URL:** `/talent`
**Access:** RECRUITER, ADMIN roles

### Dashboard (`/talent`)
- Stats grid: Active clients, Total requisitions, Pending approval, Candidates, Interviews, Placements
- Pipeline breakdown by stage (visual chart)
- Recent candidates list
- Upcoming interviews list
- Quick actions: Add Client, Create Requisition, Upload CV

### Client Management (`/talent/clients`)
- List all clients with search and status filter
- Create new client (name, industry, contact, location, notes)
- Client detail with edit mode, requisitions list, linked users

### Requisition Management (`/talent/requisitions`)
- List with status/priority badges and pending approval banner
- Create requisition (client, title, JD, work model, experience, CTC, skills)
- Detail page with:
  - Status workflow buttons (Approve → Publish → Hold → Close → Fill)
  - "Polish with AI" button for JD
  - Candidates pipeline view
  - Sidebar with details, deadline, linked job board listing

### Candidate Management (`/talent/candidates`)
- Candidate pool with search
- Add candidate with CV upload (PDF/DOCX, max 10MB)
- Candidate detail page with:
  - Profile info grid
  - CV versions with "AI Parse" button
  - Screening pipeline per requisition
  - Stage change buttons (Shortlist, Pipeline, Reject, Push to Client, Selected)
  - "AI Fit Score" button
  - Activity timeline with inline comments
  - "Schedule Interview" link

### Interview Management (`/talent/interviews`)
- List all interviews with status filter
- Schedule new interview (round name, mode, duration, interviewer, proposed slots)
- Interview detail with:
  - Proposed slots management
  - "Send to Candidate" action
  - Slot booking (on behalf of candidate)
  - Feedback form with 1-5 star rating
  - Pass/Fail/No-show/Cancel actions
  - "More rounds needed" checkbox

---

## 11. Talent Portal — Client

**URL:** `/talent/client`
**Access:** CLIENT_USER, ADMIN roles

| Page | Features |
|------|----------|
| `/talent/client` | Dashboard with stats |
| `/talent/client/requisitions` | View submitted requisitions with status |
| `/talent/client/requisitions/new` | Submit new job requirement (raw JD) |
| `/talent/client/candidates` | Review shortlisted candidates |
| `/talent/client/interviews` | View scheduled interviews |

### Candidate Review
- Expandable cards showing candidate summary, skills, experience
- View redacted CV text (phone & email hidden)
- Approve or Reject with optional comment
- Separated into "Pending Review" and "Already Reviewed" sections

---

## 12. Talent Portal — Candidate

**URL:** `/talent/candidate`
**Access:** CANDIDATE, JOB_SEEKER, ADMIN roles

| Page | Features |
|------|----------|
| `/talent/candidate` | Dashboard with profile, active applications, upcoming interviews |
| `/talent/candidate/applications` | All applications with status tracking |
| `/talent/candidate/interviews` | Interview list with "Action required" badges |
| `/talent/candidate/interviews/[id]` | Book interview slot from proposed times |

### Interview Booking
- See all proposed time slots with full date/time
- Click "Book This Slot" to confirm
- After booking: see meeting link, location, instructions
- Status updates: Pending → Book a Slot → Confirmed → Completed

---

## 13. AI Features

All AI features use **OpenAI GPT-4o-mini** via the OpenAI SDK.

### JD Polisher (`/api/talent/ai/polish-jd`)
- **Input:** Raw, informal job description from client
- **Output:** Professional HTML JD with sections (About the Role, Responsibilities, Requirements, etc.)
- **Trigger:** "Polish with AI" button on requisition detail page
- **File:** `src/lib/ai/jd-polisher.ts`

### CV Parser (`/api/talent/ai/parse-cv`)
- **Input:** Uploaded PDF or DOCX file
- **Process:**
  1. Extract text using `pdf-parse` (PDF) or `mammoth` (DOCX)
  2. Send to GPT-4o-mini for structured extraction
  3. Generate redacted version (phone & email only)
  4. Auto-fill empty candidate profile fields
- **Output:** Structured JSON with name, email, phone, skills, experience, education, summary
- **Trigger:** "AI Parse" button on CV version in candidate detail
- **File:** `src/lib/ai/cv-parser.ts`

### Fit Scorer (`/api/talent/ai/fit-score`)
- **Input:** Parsed CV data + Job requisition details
- **Output:** Score 0-100 with breakdown:
  - Skills match (40% weight)
  - Experience level (25% weight)
  - Role relevance (20% weight)
  - Overall profile (15% weight)
- **Also returns:** Matched skills, missing skills, summary assessment
- **Trigger:** "AI Fit Score" button in screening pipeline
- **File:** `src/lib/ai/fit-scorer.ts`

### PII Redaction
- **Regex-based** (no AI needed)
- Redacts email addresses → `[EMAIL REDACTED]`
- Redacts phone numbers → `[PHONE REDACTED]`
- Applied to CV text stored in `CvVersion.cvTextRedacted`
- Client portal always shows redacted version

---

## 14. Interview Scheduling

### Flow

```
Client proposes up to 5 time slots
        ↓
Recruiter creates interview → Status: SLOTS_PROPOSED
        ↓
Recruiter clicks "Send to Candidate" → Status: SENT_TO_CANDIDATE
        ↓
Candidate sees interview in portal → Books one slot → Status: BOOKED
        ↓
Interview happens → Recruiter marks "Completed" → Status: COMPLETED
        ↓
Interviewer records feedback + 1-5 rating
        ↓
Recruiter marks "Passed" or "Failed"
        ↓
If "More rounds needed" → Schedule next round (auto-increments round number)
If passed all rounds → Mark candidate as SELECTED
```

### Interview Modes
- **VIDEO** — Video call (meeting link provided)
- **PHONE** — Phone call
- **ONSITE** — In-person (location provided)

### Interview Statuses

| Status | Description |
|--------|-------------|
| `SLOTS_PROPOSED` | Client/recruiter proposed time slots |
| `SENT_TO_CANDIDATE` | Slots forwarded to candidate for booking |
| `BOOKED` | Candidate booked a slot |
| `COMPLETED` | Interview completed, awaiting feedback |
| `CANCELLED` | Interview cancelled |
| `NO_SHOW` | Candidate or interviewer did not show up |
| `PASSED` | Candidate passed this round |
| `FAILED` | Candidate did not pass |

---

## 15. Screening Pipeline

### Stages

```
PIPELINE (default) → SHORTLISTED → PUSHED_TO_CLIENT → CLIENT_APPROVED → SELECTED
    ↓                    ↓                                    ↓
 REJECTED            REJECTED                          CLIENT_REJECTED
```

| Stage | Who Acts | Description |
|-------|----------|-------------|
| `PIPELINE` | Recruiter | Default stage when candidate enters |
| `SHORTLISTED` | Recruiter | Recruiter finds candidate promising |
| `REJECTED` | Recruiter | Candidate not suitable |
| `PUSHED_TO_CLIENT` | Recruiter | Shortlisted candidate sent to client for review |
| `CLIENT_APPROVED` | Client | Client approves candidate |
| `CLIENT_REJECTED` | Client | Client rejects candidate |
| `SELECTED` | Recruiter | Candidate is hired/placed |

### Stage Change Features
- Every stage change auto-creates a `ReviewComment`
- Audit log entry created for tracking
- When pushed to client → notifications sent to client users
- Comments can be added at any stage

---

## 16. RBAC & Permissions

### Permission System
RBAC applies to **CLIENT_USER** role only. ADMIN and RECRUITER have full access.

### 16 Granular Permissions

| Permission | Description |
|------------|-------------|
| `VIEW_REQUISITIONS` | View job requisitions |
| `CREATE_REQUISITIONS` | Submit new JD/requirements |
| `EDIT_REQUISITIONS` | Edit requisition details |
| `CLOSE_REQUISITIONS` | Close/cancel requisitions |
| `VIEW_CANDIDATES` | View candidate profiles |
| `REVIEW_CANDIDATES` | Review pushed candidates |
| `APPROVE_CANDIDATES` | Approve candidates |
| `REJECT_CANDIDATES` | Reject candidates |
| `VIEW_INTERVIEWS` | View interview schedule |
| `SCHEDULE_INTERVIEWS` | Schedule interviews |
| `VIEW_CVS` | View CV documents |
| `DOWNLOAD_CVS` | Download CV files |
| `VIEW_REPORTS` | View reports |
| `MANAGE_USERS` | Manage client team users |
| `MANAGE_ROLES` | Create/edit client roles |
| `VIEW_AUDIT_LOG` | View audit trail |

### Default Role Templates

| Template | Permissions |
|----------|-------------|
| **Hiring Manager** | All requisition, candidate, interview, and CV permissions |
| **Interviewer** | View-only for requisitions, candidates, CVs, interviews |
| **Client Admin** | All 16 permissions |

---

## 17. Database Schema

### Overview
- **Database:** SQLite (file-based, no server needed)
- **ORM:** Prisma 5.22.0
- **Total Models:** 22

### Model Relationship Diagram

```
User (central)
├── Account, Session (NextAuth)
├── JobSeekerProfile
├── Company → Job → Application, SavedJob
├── RecruiterProfile → RequisitionAssignment
├── ClientUserProfile → ClientRole → Client
├── CandidateProfile → CvVersion
│                    → CandidateRequisition → ReviewComment
│                                           → Interview
├── Notification
└── AuditLog

Client
├── JobRequisition → RequisitionAssignment
│                 → CandidateRequisition
│                 → Job (published on board)
├── ClientUserProfile
└── ClientRole

SiteContent (CMS, standalone)
ContactInquiry (standalone)
```

### All Models

| Model | Table | Purpose |
|-------|-------|---------|
| `Account` | `Account` | OAuth provider accounts |
| `Session` | `Session` | User sessions |
| `VerificationToken` | `VerificationToken` | Email verification |
| `User` | `User` | All users across all roles |
| `JobSeekerProfile` | `JobSeekerProfile` | Job seeker additional data |
| `Company` | `Company` | Employer companies |
| `Job` | `Job` | Job board listings |
| `Application` | `Application` | Job applications |
| `SavedJob` | `SavedJob` | Bookmarked jobs |
| `SiteContent` | `SiteContent` | CMS content sections |
| `ContactInquiry` | `ContactInquiry` | Contact form submissions |
| `Client` | `Client` | B2B recruitment clients |
| `RecruiterProfile` | `RecruiterProfile` | Internal recruiter data |
| `ClientUserProfile` | `ClientUserProfile` | Client hiring managers |
| `ClientRole` | `ClientRole` | RBAC roles per client |
| `JobRequisition` | `JobRequisition` | Client job requirements |
| `RequisitionAssignment` | `RequisitionAssignment` | Recruiter-requisition links |
| `CandidateProfile` | `CandidateProfile` | Talent pool candidates |
| `CvVersion` | `CvVersion` | CV files with parsing data |
| `CandidateRequisition` | `CandidateRequisition` | Candidate screening pipeline |
| `ReviewComment` | `ReviewComment` | Screening comments/actions |
| `Interview` | `Interview` | Interview scheduling & feedback |
| `Notification` | `Notification` | In-app notifications |
| `AuditLog` | `AuditLog` | Compliance audit trail |

### Key Fields & Relationships

**Job.requisitionId** — Links a published job board listing back to the source `JobRequisition`. This connects the public job board to the internal talent pipeline.

**CandidateRequisition** — Junction table tracking a candidate's screening stage per requisition. One candidate can be in different stages for different requisitions.

**CvVersion** — Versioned CV management with AI parsing status. Stores original text, redacted text (PII removed), and parsed structured data (JSON).

**Interview.proposedSlots** — JSON array of `{ slotId, startTime, endTime }` objects. Max 5 slots. Candidate books one via `bookedSlotId`.

---

## 18. API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| * | `/api/auth/[...nextauth]` | NextAuth handlers (login, session, etc.) |

### Job Board

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs (search, filter, paginate) |
| GET | `/api/jobs/[id]` | Get job detail |
| POST | `/api/jobs/[id]/save` | Save/unsave job |
| GET | `/api/jobs/saved` | Get saved jobs |
| POST | `/api/applications` | Apply to job |
| GET | `/api/applications` | List user's applications |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/analytics` | Detailed analytics |
| GET/PUT | `/api/admin/users` | User management |
| GET/PUT | `/api/admin/jobs` | Job management |
| GET/PUT | `/api/admin/companies` | Company management |
| GET | `/api/admin/inquiries` | Contact inquiries |
| GET/PUT | `/api/admin/content` | CMS content management |

### Talent Portal — Recruiter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/talent/dashboard` | Dashboard stats & pipeline breakdown |
| GET/POST | `/api/talent/clients` | List/create clients |
| GET/PUT/DELETE | `/api/talent/clients/[clientId]` | Client CRUD |
| GET/POST | `/api/talent/requisitions` | List/create requisitions |
| GET/PUT | `/api/talent/requisitions/[id]` | Requisition detail/update |
| GET/POST | `/api/talent/requisitions/[id]/candidates` | Candidates for requisition |
| PUT | `/api/talent/requisitions/[id]/candidates/[crId]` | Change screening stage |
| GET/POST | `/api/talent/requisitions/[id]/candidates/[crId]/comments` | Review comments |
| GET/POST | `/api/talent/candidates` | List/create candidates |
| GET/PUT | `/api/talent/candidates/[id]` | Candidate detail/update |
| POST | `/api/talent/upload/cv` | Upload CV file |
| GET/POST | `/api/talent/interviews` | List/create interviews |
| GET/PUT | `/api/talent/interviews/[id]` | Interview detail/update |
| GET/PUT | `/api/talent/notifications` | Notifications list/mark read |

### Talent Portal — AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/talent/ai/parse-cv` | Parse CV with AI (body: `{cvVersionId}`) |
| POST | `/api/talent/ai/polish-jd` | Polish JD with AI (body: `{requisitionId, rawJd, title}`) |
| POST | `/api/talent/ai/fit-score` | Calculate fit score (body: `{candidateId, requisitionId}`) |

### Talent Portal — Client User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/talent/client/requisitions` | Client's requisitions |
| GET | `/api/talent/client/candidates` | Candidates pushed to client |
| PUT | `/api/talent/client/candidates/[crId]` | Approve/reject candidate |
| GET | `/api/talent/client/interviews` | Client's interviews |

### Talent Portal — Candidate

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/talent/candidate/profile` | Candidate's own profile |
| GET | `/api/talent/candidate/applications` | Candidate's applications |
| GET | `/api/talent/candidate/interviews` | Candidate's interviews |
| POST | `/api/talent/candidate/interviews/[id]/book` | Book interview slot |

---

## 19. Deployment

### Architecture
The application is designed for **single codebase, dual subdomain** deployment:

| Subdomain | Routes Served |
|-----------|---------------|
| `www.arbeit.com` | Public website + Job Board (`/`, `/jobs`, `/about`, etc.) |
| `talent.arbeit.com` | Talent Portal (`/talent/*`) |

Both subdomains serve from the same Next.js application — routing is handled at the reverse proxy level (e.g., Nginx, Vercel rewrites).

### Production Checklist
1. Set all environment variables (especially `NEXTAUTH_SECRET` and `OPENAI_API_KEY`)
2. Replace SQLite with PostgreSQL/MySQL for production (update `schema.prisma` provider)
3. Run `npx prisma migrate deploy` for production migrations
4. Set `NEXTAUTH_URL` to production domain
5. Configure file upload storage (S3 or persistent volume for CV uploads)
6. Enable HTTPS
7. Set up subdomain routing at reverse proxy

### Database Migration (SQLite → PostgreSQL)
```prisma
// Change in schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Then update `DATABASE_URL` to your PostgreSQL connection string and run `npx prisma migrate dev`.

---

## Appendix: File Count Summary

| Area | Files |
|------|-------|
| Public website pages | 12 |
| Auth pages | 2 |
| Job seeker dashboard | 4 |
| Employer dashboard | 4 |
| Admin panel | 9 |
| Talent - Recruiter | 12 |
| Talent - Client | 6 |
| Talent - Candidate | 5 |
| API routes | 35+ |
| Library/utilities | 11 |
| Components | 8 |
| **Total** | **~130 files** |
