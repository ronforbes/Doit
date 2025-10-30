# Product Requirements Document: LifeAlign Task Manager MVP

**Version:** 1.0
**Status:** Approved
**Last Updated:** October 30, 2025

---

## Overview

LifeAlign is a task manager that helps users connect daily work to long-term strategy. The MVP focuses on task management with a clear path to strategy features.

## Problem Statement

Existing task managers treat tasks as isolated items. Users complete tasks but lose sight of whether they're working on what matters. LifeAlign connects tasks to strategy so users can manage both execution and direction.

## Success Metrics

- User completes onboarding in under 2 minutes
- 60% of users create at least one objective within first week
- 40% daily active usage rate after 30 days
- Average session length: 5+ minutes

## Target Users

**Primary**: Knowledge workers and professionals who want better alignment between daily work and goals
**Secondary**: Team leads managing both strategy and execution

## Core Principles

1. **Fast task entry**: Add tasks in seconds, no friction
2. **Progressive disclosure**: Basic features first, strategy features emerge naturally
3. **Lightweight structure**: Strategy is helpful, not mandatory
4. **Clear hierarchy**: Vision → Objectives → Tasks (simplified for MVP)
5. **Mobile-first thinking**: Equal experience on phone and desktop

---

## MVP Feature Set

### 1. Quick Start Onboarding

**User Flow:**
- User lands on empty state
- Prompted: "What's one thing you want to accomplish today?"
- User adds first task
- Inline tip appears: "Tasks work better with a goal. Want to create one?"

**Requirements:**
- Single input field on landing
- Optional goal creation (dismissible)
- No account required to start (local storage)
- Sign-up prompt after 5 tasks or 2 days of use

### 2. Task Management (Core)

**Task Properties:**
- Title (required, max 255 characters)
- Due date (optional)
- Status: Not Started, In Progress, Complete
- Linked objective (optional)
- Notes (optional, no character limit)

**Task Operations:**
- Create task via quick-add input (always visible)
- Mark complete with checkbox
- Edit inline by clicking
- Delete with confirmation
- Drag to reorder (desktop) / long-press to reorder (mobile)
- Filter by: All, Today, This Week, No Date, No Objective, Completed

**UI Requirements:**
- Quick-add input fixed at top (mobile) or prominent at top (desktop)
- Task list below with virtual scrolling
- Touch-optimized tap targets (minimum 44x44px on mobile)
- Keyboard shortcuts (desktop only):
  - `Cmd/Ctrl + K` to quick-add
  - `Enter` to create task
  - `Cmd/Ctrl + Enter` to create and add another
- Swipe gestures (mobile): Swipe right to complete, swipe left for options

### 3. Objectives (Light Strategy Layer)

**Objective Properties:**
- Title (required, max 255 characters)
- Description (optional)
- Start date (required)
- Target completion date (required)
- Status: Active, Completed, Archived

**Objective Operations:**
- Create from task view or dedicated Objectives view
- View all tasks linked to an objective
- Archive completed objectives
- Maximum 5 active objectives (MVP constraint)

**UI Requirements:**
- Sidebar shows active objectives (desktop) / Bottom drawer or menu (mobile)
- Click/tap objective to filter tasks
- Tasks show objective tag as colored label
- Create objective from task context menu (desktop) / long-press menu (mobile)

### 4. Views

**Today View (Default)**
- Shows tasks due today
- Shows tasks marked "In Progress"
- Shows overdue tasks (highlighted)
- Quick stats: X tasks completed today

**All Tasks View**
- Complete task list
- Grouped by objective (with "No Objective" filter option)
- Collapsible groups

**Objectives View**
- Grid of active objectives (2 columns mobile, 3-4 columns desktop)
- Shows task count per objective
- Shows completion percentage
- Shows date range (start - target)
- Tap/click to see objective detail + linked tasks

**Inbox View**
- Tasks without objectives (uses "No Objective" filter)
- Prompt to link tasks to objectives
- Quick-assign objective action

### 5. Progressive Strategy Prompts

**Contextual Nudges:**
- After creating 10 tasks: "You've added 10 tasks! Consider grouping them into objectives."
- After completing 5 tasks in one area: "Looks like [pattern] is important. Make it an objective?"
- Weekly: "What's your main focus this week?" (creates objective if answered)

**Requirements:**
- Dismissible without penalty
- Never block core workflow
- Only one nudge visible at a time
- Respect "don't show again" preference
- Appear as non-intrusive banners or bottom sheets

### 6. Basic Settings

**User Preferences:**
- Display name
- Default view on open
- Week starts on (Monday/Sunday)
- Show completed tasks (on/off)
- Dark mode toggle (respects system preference by default)

**Data Management:**
- Export all data (JSON)
- Delete account and data
- Email for account (required for sync)

**Timezone:**
- Uses device's current timezone automatically
- All dates/times displayed in device timezone
- No timezone conversion in MVP

---

## MVP Exclusions (Future Versions)

### V2 Features
- Vision statements
- Key Results with metrics
- Roadmap timeline view
- Multi-level task hierarchies (subtasks)
- Collaboration/sharing
- Native mobile apps (iOS/Android)
- Calendar integration
- Timezone selection and management
- Bulk operations

### V3 Features
- Team workspaces
- Strategic frameworks (OKRs, SMART goals)
- Analytics and insights
- Templates
- Recurring tasks
- Time tracking

---

## Technical Requirements

### Frontend

- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Type safety: TypeScript
- State management: React Context or Zustand
- Local-first with cloud sync
- Responsive design: Mobile-first, desktop-optimized
- Progressive Web App (PWA) capabilities
- Works offline with sync on reconnect

### Mobile Optimization

- Touch-optimized interactions
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Mobile gestures: swipe, long-press, pull-to-refresh
- Optimized for one-handed use on mobile
- Fast tap response (< 100ms)
- Minimal data transfer for mobile networks

### Backend

- Next.js API Routes
- Authentication: NextAuth.js (Email + password)
- Database: PostgreSQL with Prisma ORM
- Deployment: Vercel (recommended)
- Real-time sync not required for MVP

### Data Schema

```typescript
User {
  id: string
  email: string
  name: string
  preferences: json
  createdAt: datetime
  updatedAt: datetime
}

Objective {
  id: string
  userId: string
  title: string (max 255)
  description: text
  startDate: date
  targetDate: date
  status: enum (active, completed, archived)
  color: string
  order: int
  createdAt: datetime
  updatedAt: datetime
}

Task {
  id: string
  userId: string
  objectiveId: string (nullable)
  title: string (max 255)
  notes: text
  dueDate: date (nullable)
  status: enum (not_started, in_progress, complete)
  order: int
  createdAt: datetime
  updatedAt: datetime
  completedAt: datetime (nullable)
}
```

### Performance Requirements

- Initial load: < 2 seconds on 4G connection
- Task operations: < 100ms perceived latency
- Support 1000+ tasks per user
- Lighthouse score: 90+ (Performance, Accessibility)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

## Design Requirements

### Visual Hierarchy

- Clear separation between quick-add and task list
- Objectives visible but not dominant
- Completed tasks visually subdued
- Empty states guide next action

### Mobile-Specific

- Bottom navigation or tab bar for main views
- Floating action button (FAB) for quick-add
- Pull-to-refresh gesture
- Swipe gestures for common actions
- Large, touch-friendly buttons and inputs
- Thumb-zone optimization for primary actions

### Desktop-Specific

- Sidebar navigation
- Keyboard shortcuts displayed in tooltips
- Hover states for interactive elements
- Multi-column layouts where appropriate

### Color Usage

- Each objective gets unique color from predefined palette
- Tasks inherit objective color as subtle indicator
- Status colors: Green (complete), Blue (in progress), Gray (not started)
- Dark mode: OLED-friendly blacks on mobile

### Typography

- Task titles: 16px mobile, 16px desktop
- Metadata: 13px mobile, 13px desktop
- Line height optimized for readability
- System font stack for performance

### Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## User Stories

**Story 1: Quick Task Capture**
As a busy professional on my phone, I want to quickly capture tasks without setup, so I don't lose my thoughts.

**Story 2: Goal Connection**
As someone working on multiple projects, I want to see which tasks relate to which goals on both mobile and desktop, so I can prioritize effectively.

**Story 3: Focus View**
As a person who gets overwhelmed, I want to see only today's tasks on my phone while commuting, so I can focus on what matters now.

**Story 4: Natural Progression**
As a new user on mobile, I want the app to grow with my needs, so I'm not forced into a rigid system immediately.

**Story 5: Strategy Alignment**
As someone with long-term goals, I want to occasionally review if my tasks support my objectives on my desktop, so I don't drift off course.

**Story 6: Seamless Mobile-Desktop**
As a user who switches between phone and computer, I want my tasks and objectives to sync automatically, so I can work from anywhere.

---

## Resolved Questions

1. **Objectives dates**: Objectives have both start dates and target completion dates (required)
2. **Task title limit**: Maximum 255 characters
3. **Bulk operations**: Not included in MVP
4. **Timezone**: Uses device's current timezone (no conversion or selection)
5. **"No Objective" category**: Available as a filter, not a persistent category

---

## Launch Criteria

### Must Have

- All core features functional on mobile and desktop
- Responsive layout tested on common devices
- Touch gestures working on mobile
- Keyboard shortcuts working on desktop
- Account creation and login
- Data export capability
- Basic error handling
- PWA installation support
- Offline functionality

### Should Have

- Empty states with helpful content
- Onboarding tutorial (skippable)
- Performance benchmarks met
- Swipe gestures polished
- Dark mode implementation

### Nice to Have

- Undo/redo
- Drag-and-drop objective assignment (desktop)
- Task duplication
- Markdown in notes
- Pull-to-refresh animation

---

## Development Stack Summary

### Core Technologies

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js

### Recommended Libraries

- date-fns (date manipulation)
- react-hook-form (forms)
- zod (validation)
- @dnd-kit/core (drag and drop, desktop)
- framer-motion (animations, optional)

---

## Next Steps

1. Review and approve PRD ✓
2. Set up Next.js project with Tailwind
3. Design mobile and desktop mockups
4. Set up database schema with Prisma
5. Implement authentication
6. Build task management core (mobile-first)
7. Add objectives layer
8. Implement views and filters
9. Add progressive prompts
10. Testing on multiple devices
11. Performance optimization
12. Beta launch

---

**Document Control**

- **Owner**: Product Management
- **Stakeholders**: Engineering, Design, QA
- **Review Cycle**: Weekly during development
- **Change Log**: Track all changes with date and reason
