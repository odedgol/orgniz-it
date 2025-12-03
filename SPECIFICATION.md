# Orgniz-it - Complete Project Specification

> A minimalist job search organizer app for managing daily learning tasks and job applications.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Features](#features)
4. [Screens & Views](#screens--views)
5. [Technical Architecture](#technical-architecture)
6. [Data Models](#data-models)
7. [UI/UX Design System](#uiux-design-system)
8. [Git Workflow](#git-workflow)
9. [Development Phases](#development-phases)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)

---

## Overview

**Orgniz-it** is a productivity app designed specifically for job seekers to organize their daily learning tasks, track job applications, and maintain motivation through streak tracking.

### Problem Statement
Job searching is overwhelming. You need to:
- Study algorithms, system design, and other technical topics
- Track multiple job applications across different stages
- Prepare for interviews
- Stay motivated over weeks/months of searching

### Solution
A single, focused app that combines task management with job tracking, featuring:
- Simple task management with subject categorization
- Visual job application pipeline
- Multiple calendar views (Day/Week/Month)
- Streak tracking for motivation
- Interview scheduling with reminders

---

## Design Philosophy

### Inspired By
- **Linear** - Minimal UI, keyboard-first, fast interactions
- **Todoist** - Simple task management, natural language input
- **Notion** - Clean typography, dark mode aesthetic

### Core Principles

1. **Linear UX** - Reduce cognitive load through single-direction flow
2. **One Screen Philosophy** - Minimize navigation complexity
3. **Dark Mode First** - Calming, focused aesthetic for long sessions
4. **Speed** - Sub-100ms interactions, instant feedback
5. **Keyboard First** - Power users can navigate without mouse

### What We're NOT Building
- ❌ Time tracking / Pomodoro timer
- ❌ Complex project management
- ❌ Team collaboration features
- ❌ Badges/achievements system
- ❌ Social features

---

## Features

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Task Management | Create, complete, reorder daily tasks | P0 |
| Subject Categories | Organize tasks by learning topic | P0 |
| Job Pipeline | Track applications through stages | P0 |
| Calendar Views | Day, Week, Month views | P0 |
| Streak Tracking | Daily completion streaks | P1 |
| Interview Scheduler | Schedule & get reminders | P1 |
| Stats Dashboard | Weekly progress overview | P1 |
| Push Notifications | Reminders & alerts | P2 |
| PWA Support | Install as mobile app | P2 |

### Feature Details

#### 1. Task Management
- Add tasks with subject assignment
- Mark tasks as complete
- Drag-to-reorder tasks
- Tasks are date-specific
- Quick add with keyboard shortcut (N)

#### 2. Subject Categories
- Create custom subjects (e.g., Algorithms, System Design, React)
- Assign color to each subject
- Set weekly task goals per subject
- Add topic tags to subjects
- Track progress toward weekly goals

#### 3. Job Application Pipeline
- **Stages**: Wishlist → Applied → Screening → Interview → Offer → Rejected
- Store: Company, Title, URL, Location, Salary Range, Contact
- Add notes to each application
- Filter by stage

#### 4. Interview Scheduler
- Schedule interviews linked to job applications
- Interview types: Phone Screen, Technical, Behavioral, Onsite, Final
- Automatic reminders: 1 day before + 1 hour before
- Add interviewer name and notes

#### 5. Calendar Views
- **Day View**: Hourly timeline with task blocks
- **Week View**: 7-day overview with task list (default)
- **Month View**: Full calendar grid with dot indicators

#### 6. Streak Tracking
- Track consecutive days with completed tasks
- Visual fire emoji indicator
- Streak protection reminder at 8 PM

---

## Screens & Views

### Screen 1: Dashboard (Week View - Default)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Good morning! 👋                   │
│                        │ Day 23 • 🔥 7 day streak           │
│ VIEWS                  │─────────────────────────────────────│
│ ● Today     🔥7        │ [Day] [Week] [Month]    [+ Add Task]│
│ ○ Day                  │─────────────────────────────────────│
│ ○ Month                │                                     │
│                        │ ┌─────┬─────┬─────┬─────┐          │
│ MANAGE                 │ │Today│This │Apps │Inter│          │
│ ○ Subjects   4         │ │  5  │Week │ 12  │views│          │
│ ○ Jobs      12         │ │     │ 18  │     │  3  │          │
│ ○ Stats                │ └─────┴─────┴─────┴─────┘          │
│                        │                                     │
│ SUBJECTS               │ Today's Tasks • Wed, Dec 3         │
│ ● Algorithms           │ ┌───────────────────────────────┐  │
│ ● System Design        │ │ ✓ LeetCode - Binary Search    │  │
│ ● React                │ │ ✓ Apply to Stripe             │  │
│ ● Applications         │ │ ○ DDIA Chapter 5              │  │
│                        │ │ ○ React Custom Hooks          │  │
│                        │ │ ○ Prepare for Vercel          │  │
│                        │ │ + Add a task...           [N] │  │
│                        │ └───────────────────────────────┘  │
│                        │                                     │
│                        │ [Mon✓][Tue✓][Wed●][Thu][Fri][Sat][Sun]│
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Greeting header with day count and streak
- View toggle (Day/Week/Month)
- Stats cards row (4 cards)
- Task list with checkboxes
- Week strip calendar at bottom

### Screen 2: Day View

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Day View                           │
│                        │ Detailed timeline for planning     │
│                        │─────────────────────────────────────│
│                        │ ◀ Wednesday, December 3, 2025 ▶    │
│                        │─────────────────────────────────────│
│                        │                    │ Summary       │
│                        │  8 AM │            │ Tasks: 2/5    │
│                        │  9 AM │ ▌LeetCode  │ Done: 40%     │
│                        │ 10 AM │ ▌Stripe    │ Streak: 🔥7   │
│                        │ 11 AM │            │───────────────│
│                        │ 12 PM │            │ Upcoming      │
│                        │  1 PM │ ▌DDIA Ch5  │ 🟠 Vercel     │
│                        │  2 PM │ ▌Vercel    │   Tomorrow 2PM│
│                        │  3 PM │ ▌React     │ 🔵 Notion     │
│                        │  4 PM │            │   Dec 8 10AM  │
│                        │  5 PM │            │               │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Date navigation header
- Hourly timeline (scrollable)
- Timeline event blocks (color-coded)
- Sidebar: Summary card, Upcoming interviews, Subject focus

### Screen 3: Month View

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Month View                         │
│                        │ Plan ahead and see the big picture │
│                        │─────────────────────────────────────│
│                        │      ◀  December 2025  ▶           │
│                        │─────────────────────────────────────│
│                        │ Sun Mon Tue Wed Thu Fri Sat │Stats │
│                        │      1🔥 2🔥 [3]  4   5   6  │Tasks │
│                        │              ●●  🟠         │ 45   │
│                        │  7   8   9  10  11  12  13  │Done  │
│                        │      🟠                      │ 12   │
│                        │ 14  15  16  17  18  19  20  │──────│
│                        │                              │Dec 3 │
│                        │ 21  22  23  24  25  26  27  │ ✓ LC │
│                        │                              │ ✓ App│
│                        │ 28  29  30  31              │ ○ DDIA│
│                        │─────────────────────────────│      │
│                        │ ● Task  ● Done  🟠 Interview │      │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Month navigation header
- Full calendar grid (7 columns)
- Dot indicators (tasks, completed, interviews)
- Streak fire emoji on streak days
- Legend bar
- Sidebar: Month overview, Selected day tasks, Upcoming interviews

### Screen 4: Subjects

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Subjects                           │
│                        │ Track your learning progress       │
│                        │─────────────────────────────────────│
│                        │                        [+ Add Subject]
│                        │─────────────────────────────────────│
│                        │ ┌─────────────────┬─────────────────┐
│                        │ │ 🔵 Algorithms   │ 🟢 System Design│
│                        │ │ ████████░░ 6/8  │ █████░░░░░ 3/6  │
│                        │ │ Binary Search   │ Scalability     │
│                        │ │ DP, Graphs      │ Databases       │
│                        │ ├─────────────────┼─────────────────┤
│                        │ │ 🔵 React        │ 🟠 Applications │
│                        │ │ █████████░ 9/10 │ ██████░░░░ 6/10 │
│                        │ │ Hooks, Perf     │ Resume, Cover   │
│                        │ │ Testing         │ Networking      │
│                        │ └─────────────────┴─────────────────┘
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Subject cards grid (2 columns)
- Color indicator + name
- Progress bar (weekly goal)
- Topic tags
- Add subject button

### Screen 5: Jobs

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Job Applications                   │
│                        │ Track your job hunt pipeline       │
│                        │─────────────────────────────────────│
│                        │ [All 12][Wishlist 3][Applied 4]    │
│                        │ [Screening 2][Interview 3]         │
│                        │─────────────────────────────────────│
│                        │ ⚠️ Upcoming Interview Tomorrow      │
│                        │    Vercel - Phone Screen 2:00 PM   │
│                        │─────────────────────────────────────│
│                        │ ┌───────────────────────────────┐  │
│                        │ │ Vercel          [Interview]   │  │
│                        │ │ Senior Frontend Engineer      │  │
│                        │ │ 📅 Dec 4 • 📍 Remote • $180-220k│  │
│                        │ ├───────────────────────────────┤  │
│                        │ │ Stripe          [Applied]     │  │
│                        │ │ Frontend Engineer, Dashboard  │  │
│                        │ │ 📅 Today • 📍 San Francisco   │  │
│                        │ └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Pipeline filter tabs (with counts)
- Interview alert banner
- Job cards list
- Job card: Company, Title, Status badge, Meta (date, location, salary)

### Screen 6: Stats

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]              │ Stats                              │
│                        │ Your progress this week            │
│                        │─────────────────────────────────────│
│                        │ ┌─────┬─────┬─────┬─────┐          │
│                        │ │🔥 7 │ 32  │ 12  │ 42% │          │
│                        │ │days │tasks│ apps│resp │          │
│                        │ └─────┴─────┴─────┴─────┘          │
│                        │─────────────────────────────────────│
│                        │ Daily Activity        │ By Subject │
│                        │ ▁▃▂▄▃▁▂              │ Algo   ███░ │
│                        │ M T W T F S S        │ React  ████ │
│                        │                       │ SD     ██░░ │
│                        │                       │ Apps   ██░░ │
│                        │─────────────────────────────────────│
│                        │ Pipeline: 3 → 4 → 2 → 3 → 0       │
│                        │          Wish App Scrn Int Offer  │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Stats cards row (Streak, Tasks, Apps, Response Rate)
- Daily activity bar chart
- Subject progress breakdown
- Pipeline funnel visualization

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Next.js 14 (App Router) | SSR, routing, Vercel deployment |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Rapid UI development |
| State | Zustand | Simple, lightweight state management |
| Backend | Firebase | Auth + Firestore (NoSQL) |
| Hosting | Vercel | Free tier, easy deployment |
| PWA | next-pwa | Mobile app experience |

### Project Structure

```
orgniz-it/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard (Week View)
│   │   ├── day/page.tsx          # Day View
│   │   ├── month/page.tsx        # Month View
│   │   ├── subjects/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── stats/page.tsx
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/                   # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ViewToggle.tsx
│   │   │
│   │   └── features/
│   │       ├── tasks/
│   │       ├── calendar/
│   │       ├── subjects/
│   │       ├── jobs/
│   │       └── stats/
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   │
│   ├── stores/
│   │   ├── taskStore.ts
│   │   ├── subjectStore.ts
│   │   ├── jobStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   ├── useSubjects.ts
│   │   ├── useJobs.ts
│   │   └── useStreak.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
│   ├── icons/
│   └── manifest.json
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── mockups/
│   └── index.html
│
└── docs/
    └── SPECIFICATION.md
```

---

## Data Models

### Firebase Collections

#### users/{userId}
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  settings: {
    dailyReminderTime: string;      // "09:00"
    weekStartsOn: 'sunday' | 'monday';
    theme: 'dark' | 'light' | 'system';
  };
  streak: {
    current: number;
    longest: number;
    lastCompletedDate: string;      // "2025-12-03"
  };
}
```

#### subjects/{subjectId}
```typescript
interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;                    // Hex color
  weeklyGoalTasks: number;
  topics: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### tasks/{taskId}
```typescript
interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  date: string;                     // "2025-12-03"
  completed: boolean;
  completedAt?: Timestamp;
  order: number;                    // For drag-to-reorder
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### jobs/{jobId}
```typescript
interface Job {
  id: string;
  userId: string;
  company: string;
  title: string;
  url?: string;
  status: 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedDate?: Timestamp;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  contact?: {
    name: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### interviews/{interviewId}
```typescript
interface Interview {
  id: string;
  jobId: string;
  userId: string;
  date: Timestamp;
  time: string;                     // "14:00"
  type: 'phone' | 'technical' | 'behavioral' | 'onsite' | 'final' | 'other';
  interviewer?: string;
  notes?: string;
  reminderSent: {
    dayBefore: boolean;
    hourBefore: boolean;
  };
  createdAt: Timestamp;
}
```

---

## UI/UX Design System

### Color Palette (Dark Theme)

```css
/* Backgrounds */
--bg-primary: #0A0A0B;
--bg-secondary: #141416;
--bg-tertiary: #1C1C1F;
--bg-hover: #232328;
--bg-active: #2A2A30;

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.1);
--border-strong: rgba(255, 255, 255, 0.15);

/* Text */
--text-primary: #FAFAFA;
--text-secondary: #A1A1A6;
--text-tertiary: #6B6B70;
--text-muted: #4A4A4F;

/* Accents */
--accent-blue: #5E6AD2;
--accent-purple: #9F7AEA;
--accent-green: #3DCC79;
--accent-orange: #F59E0B;
--accent-red: #EF4444;
--accent-cyan: #22D3EE;
```

### Subject Colors (Preset Options)
```css
--subject-blue: #5E6AD2;
--subject-green: #3DCC79;
--subject-cyan: #22D3EE;
--subject-orange: #F59E0B;
--subject-purple: #9F7AEA;
--subject-red: #EF4444;
--subject-pink: #EC4899;
--subject-yellow: #EAB308;
```

### Typography

```css
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 13px;
--text-md: 14px;
--text-lg: 15px;
--text-xl: 16px;
--text-2xl: 20px;
--text-3xl: 28px;
```

### Spacing & Radius

```css
/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Add new task |
| `⌘ + K` | Open command palette |
| `⌘ + 1` | Go to Dashboard |
| `⌘ + 2` | Go to Day View |
| `⌘ + 3` | Go to Month View |
| `⌘ + 4` | Go to Subjects |
| `⌘ + 5` | Go to Jobs |
| `⌘ + 6` | Go to Stats |

---

## Git Workflow

### Branch Structure

```
main                    # Production (stable releases only)
  └── develop           # Integration branch
       ├── feature/dashboard
       ├── feature/day-view
       ├── feature/month-view
       ├── feature/subjects
       ├── feature/jobs
       └── feature/stats
```

### Workflow Rules

1. **Feature Development**
   - Create feature branch from `develop`
   - Work on feature branch (FP)
   - Run tests on every change
   - Request approval before merging to FP
   - When feature ready, merge to `develop`

2. **Testing Requirements**
   - Run E2E tests before each merge request
   - Run feature tests on each change
   - All tests must pass before merge

3. **Commit Messages**
   ```
   feat: add task completion functionality
   fix: resolve date picker timezone issue
   refactor: simplify task store logic
   test: add e2e tests for job pipeline
   docs: update API documentation
   ```

### Feature Branches

| Branch | Feature | Status |
|--------|---------|--------|
| `feature/dashboard` | Week view, task list, stats cards | Pending |
| `feature/day-view` | Day timeline, hourly blocks | Pending |
| `feature/month-view` | Calendar grid, month stats | Pending |
| `feature/subjects` | Subject CRUD, progress tracking | Pending |
| `feature/jobs` | Job pipeline, interview scheduler | Pending |
| `feature/stats` | Charts, analytics, pipeline funnel | Pending |

---

## Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Tailwind CSS configuration
- [ ] Firebase project setup (Auth + Firestore)
- [ ] Base UI components (Button, Card, Input, Modal)
- [ ] Layout components (Sidebar, Header)
- [ ] Authentication flow (Google Sign-in)

### Phase 2: Dashboard & Tasks (Week 2)
- [ ] Task data model & Firestore integration
- [ ] TaskList, TaskItem components
- [ ] Task completion logic
- [ ] Week strip calendar
- [ ] Stats cards

### Phase 3: Calendar Views (Week 3)
- [ ] Day View with hourly timeline
- [ ] Month View calendar grid
- [ ] View toggle component
- [ ] Date navigation

### Phase 4: Subjects (Week 4)
- [ ] Subject CRUD operations
- [ ] SubjectCard component
- [ ] Weekly goal progress
- [ ] Color picker

### Phase 5: Jobs & Interviews (Week 5)
- [ ] Job pipeline
- [ ] JobCard component
- [ ] Interview scheduler
- [ ] Interview alerts

### Phase 6: Stats & Polish (Week 6)
- [ ] Stats dashboard
- [ ] Charts (Activity, Progress, Pipeline)
- [ ] Keyboard shortcuts
- [ ] PWA setup

### Phase 7: Testing & Deployment (Week 7)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Vercel deployment

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
describe('taskStore', () => {
  it('should add a new task', () => {
    // ...
  });
  it('should toggle task completion', () => {
    // ...
  });
});
```

### E2E Tests (Playwright)

```typescript
test('user can add and complete a task', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="add-task-input"]');
  // ...
});
```

### Test Commands

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:all      # All tests
```

---

## Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

### URLs

- **Production**: `https://orgniz-it.vercel.app`

---

## Appendix

### A. Notification Types

| Type | Trigger | Message |
|------|---------|---------|
| Daily Reminder | 9:00 AM | "Ready to plan your day?" |
| Interview (1 day) | Day before | "Interview tomorrow at {time}" |
| Interview (1 hour) | 1 hour before | "Interview in 1 hour with {company}" |
| Streak Protection | 8:00 PM | "Don't break your {n}-day streak!" |

### B. PWA Manifest

```json
{
  "name": "Orgniz-it",
  "short_name": "Orgniz-it",
  "description": "Job search organizer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0B",
  "theme_color": "#5E6AD2"
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 3, 2025
