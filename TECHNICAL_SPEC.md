# Technical Specification: LifeAlign Task Manager MVP

**Version:** 1.0
**Status:** Draft
**Last Updated:** October 30, 2025
**Related Documents:** Product Requirements Document v1.0

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Specifications](#api-specifications)
5. [Frontend Architecture](#frontend-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management](#state-management)
8. [Offline & Sync Strategy](#offline--sync-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Security](#security)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)
13. [Development Environment](#development-environment)
14. [File Structure](#file-structure)
15. [Third-Party Dependencies](#third-party-dependencies)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Mobile     │  │   Tablet     │  │   Desktop    │      │
│  │  (375-767px) │  │ (768-1023px) │  │   (1024px+)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            ▼                                 │
│                   Next.js Application                        │
│                    (React 18+ / App Router)                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Next.js API Routes)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth API   │  │   Task API   │  │ Objective API│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Prisma ORM  │  │ Redis Cache  │      │
│  │   (Primary)  │  │  (Optional)  │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure (Vercel)                      │
│  • Edge Network (CDN)                                        │
│  • Serverless Functions                                      │
│  • Automatic SSL                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Task Creation Flow:**
```
User Input → Client Validation → Local Storage (Optimistic Update)
→ API Request → Database Write → Sync Confirmation → UI Update
```

**Offline-First Flow:**
```
User Action → IndexedDB Write → Background Sync Queue
→ Network Available → Batch Sync → Conflict Resolution
```

---

## Technology Stack

### Core Framework
- **Next.js 14+** (App Router)
  - Server Components for initial page loads
  - Client Components for interactive elements
  - API Routes for backend logic
  - Middleware for authentication checks

### Frontend
- **React 18+**
  - Hooks: useState, useEffect, useCallback, useMemo
  - Context API for global state
  - Suspense for loading states
- **TypeScript 5+**
  - Strict mode enabled
  - Type safety across all components
- **Tailwind CSS 3+**
  - Custom configuration for brand colors
  - Mobile-first responsive design
  - Dark mode support

### Backend
- **Next.js API Routes**
  - RESTful API design
  - Request validation with Zod
  - Error handling middleware
- **Prisma 5+**
  - Type-safe database client
  - Schema migrations
  - Query optimization

### Database
- **PostgreSQL 15+**
  - Primary data store
  - JSONB for preferences
  - Indexes on frequently queried fields

### Authentication
- **NextAuth.js v5**
  - Email/password provider
  - JWT session strategy
  - CSRF protection

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Unit testing
- **Playwright** - E2E testing

---

## Database Schema

### Prisma Schema Definition

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  emailVerified DateTime?
  name          String?
  password      String
  preferences   Json        @default("{}")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  objectives    Objective[]
  tasks         Task[]
  accounts      Account[]
  sessions      Session[]

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Objective {
  id          String           @id @default(cuid())
  userId      String
  title       String           @db.VarChar(255)
  description String?          @db.Text
  startDate   DateTime
  targetDate  DateTime
  status      ObjectiveStatus  @default(ACTIVE)
  color       String           @default("#3b82f6")
  order       Int              @default(0)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]

  @@index([userId, status])
  @@index([userId, order])
}

enum ObjectiveStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

model Task {
  id          String      @id @default(cuid())
  userId      String
  objectiveId String?
  title       String      @db.VarChar(255)
  notes       String?     @db.Text
  dueDate     DateTime?
  status      TaskStatus  @default(NOT_STARTED)
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  completedAt DateTime?

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  objective   Objective?  @relation(fields: [objectiveId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([userId, dueDate])
  @@index([userId, objectiveId])
  @@index([userId, order])
}

enum TaskStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETE
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Database Indexes Strategy

**Primary Indexes:**
- `users.email` - Unique index for login lookups
- `tasks.userId` + `status` - Composite for filtering user's tasks
- `tasks.userId` + `dueDate` - Composite for date-based queries
- `objectives.userId` + `status` - Composite for active objectives

**Performance Considerations:**
- Index on `order` fields for drag-and-drop operations
- Partial indexes on `completedAt IS NULL` for active tasks (future optimization)

---

## API Specifications

### RESTful API Endpoints

#### Authentication Endpoints

```typescript
// POST /api/auth/register
Request: {
  email: string;
  password: string;
  name?: string;
}
Response: {
  user: {
    id: string;
    email: string;
    name: string | null;
  }
}

// POST /api/auth/login
// Handled by NextAuth.js
// Uses NextAuth credentials provider

// POST /api/auth/logout
// Handled by NextAuth.js
```

#### Task Endpoints

```typescript
// GET /api/tasks
Query Parameters:
  - status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'
  - objectiveId?: string
  - dueDate?: 'today' | 'week' | 'overdue' | 'none'
  - includeCompleted?: boolean

Response: {
  tasks: Task[];
  total: number;
}

// POST /api/tasks
Request: {
  title: string;
  notes?: string;
  dueDate?: string (ISO 8601);
  objectiveId?: string;
  status?: TaskStatus;
}
Response: {
  task: Task;
}

// PATCH /api/tasks/[id]
Request: {
  title?: string;
  notes?: string;
  dueDate?: string | null;
  objectiveId?: string | null;
  status?: TaskStatus;
  order?: number;
}
Response: {
  task: Task;
}

// DELETE /api/tasks/[id]
Response: {
  success: boolean;
}

// POST /api/tasks/bulk-update
Request: {
  updates: Array<{
    id: string;
    order: number;
  }>;
}
Response: {
  updated: number;
}
```

#### Objective Endpoints

```typescript
// GET /api/objectives
Query Parameters:
  - status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

Response: {
  objectives: Array<Objective & {
    taskCount: number;
    completedTaskCount: number;
  }>;
}

// POST /api/objectives
Request: {
  title: string;
  description?: string;
  startDate: string (ISO 8601);
  targetDate: string (ISO 8601);
  color?: string;
}
Response: {
  objective: Objective;
}

// PATCH /api/objectives/[id]
Request: {
  title?: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status?: ObjectiveStatus;
  color?: string;
}
Response: {
  objective: Objective;
}

// DELETE /api/objectives/[id]
Response: {
  success: boolean;
}

// GET /api/objectives/[id]/tasks
Response: {
  objective: Objective;
  tasks: Task[];
}
```

#### User Endpoints

```typescript
// GET /api/user/profile
Response: {
  user: {
    id: string;
    email: string;
    name: string | null;
    preferences: UserPreferences;
  }
}

// PATCH /api/user/profile
Request: {
  name?: string;
  preferences?: Partial<UserPreferences>;
}
Response: {
  user: User;
}

// POST /api/user/export
Response: {
  data: {
    tasks: Task[];
    objectives: Objective[];
    exportedAt: string;
  }
}

// DELETE /api/user/account
Response: {
  success: boolean;
}
```

### API Response Format

**Success Response:**
```typescript
{
  success: true,
  data: T,
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Error Codes

- `AUTH_REQUIRED` - 401 - User not authenticated
- `FORBIDDEN` - 403 - User lacks permission
- `NOT_FOUND` - 404 - Resource not found
- `VALIDATION_ERROR` - 400 - Invalid input data
- `CONFLICT` - 409 - Resource conflict (e.g., duplicate)
- `RATE_LIMIT` - 429 - Too many requests
- `SERVER_ERROR` - 500 - Internal server error

---

## Frontend Architecture

### Component Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── today/
│   │   │   └── page.tsx
│   │   ├── all/
│   │   │   └── page.tsx
│   │   ├── objectives/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── inbox/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── objectives/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── user/
│   │       ├── profile/
│   │       │   └── route.ts
│   │       └── export/
│   │           └── route.ts
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskQuickAdd.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilters.tsx
│   ├── objectives/
│   │   ├── ObjectiveCard.tsx
│   │   ├── ObjectiveGrid.tsx
│   │   ├── ObjectiveForm.tsx
│   │   └── ObjectiveDetail.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Header.tsx
│   │   └── UserMenu.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── DatePicker.tsx
│   │   ├── Checkbox.tsx
│   │   └── Toast.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── api-client.ts             # API client utilities
│   ├── date-utils.ts             # Date helpers
│   └── validation.ts             # Zod schemas
├── hooks/
│   ├── useTask.ts
│   ├── useObjectives.ts
│   ├── useLocalStorage.ts
│   ├── useOfflineSync.ts
│   └── useMediaQuery.ts
├── contexts/
│   ├── TaskContext.tsx
│   ├── ObjectiveContext.tsx
│   └── ThemeContext.tsx
├── types/
│   ├── task.ts
│   ├── objective.ts
│   ├── user.ts
│   └── api.ts
└── styles/
    └── globals.css               # Tailwind imports
```

### Key Components Specification

#### TaskQuickAdd Component

```typescript
// components/tasks/TaskQuickAdd.tsx

interface TaskQuickAddProps {
  onTaskCreated?: (task: Task) => void;
  defaultObjectiveId?: string;
  placeholder?: string;
}

export function TaskQuickAdd({
  onTaskCreated,
  defaultObjectiveId,
  placeholder = "Add a task..."
}: TaskQuickAddProps) {
  // Features:
  // - Auto-focus on mount (desktop only)
  // - Keyboard shortcut (Cmd/Ctrl+K)
  // - Optimistic UI update
  // - Error handling with toast
  // - Clear input after submit
}
```

#### TaskItem Component

```typescript
// components/tasks/TaskItem.tsx

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showObjective?: boolean;
}

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  showObjective = true
}: TaskItemProps) {
  // Features:
  // - Inline editing
  // - Checkbox for completion
  // - Swipe gestures (mobile)
  // - Context menu (desktop)
  // - Drag handle for reordering
}
```

#### ObjectiveCard Component

```typescript
// components/objectives/ObjectiveCard.tsx

interface ObjectiveCardProps {
  objective: Objective & {
    taskCount: number;
    completedTaskCount: number;
  };
  onClick?: () => void;
}

export function ObjectiveCard({ objective, onClick }: ObjectiveCardProps) {
  // Features:
  // - Progress bar calculation
  // - Date range display
  // - Task count badge
  // - Color indicator
  // - Click to view details
}
```

### Responsive Design Breakpoints

```typescript
// tailwind.config.ts

const config = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    },
  },
}
```

### Mobile-Specific Components

```typescript
// Mobile Navigation
<MobileNav>
  - Bottom navigation bar
  - Fixed positioning
  - Active state indicators
  - Touch-optimized tap targets (44x44px minimum)

// Mobile Gestures
- Swipe right: Mark complete
- Swipe left: Show options menu
- Long press: Reorder mode
- Pull to refresh: Sync data
```

---

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// lib/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Protected Routes

```typescript
// middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
});

export const config = {
  matcher: [
    "/today/:path*",
    "/all/:path*",
    "/objectives/:path*",
    "/inbox/:path*",
    "/api/tasks/:path*",
    "/api/objectives/:path*",
    "/api/user/:path*",
  ]
};
```

### Authorization Checks

```typescript
// lib/api-utils.ts

export async function getAuthenticatedUser(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

// Usage in API routes
export async function GET(req: Request) {
  const userId = await getAuthenticatedUser(req);

  const tasks = await prisma.task.findMany({
    where: { userId }
  });

  return Response.json({ tasks });
}
```

---

## State Management

### Context-Based State Management

```typescript
// contexts/TaskContext.tsx

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: Error | null;

  // Actions
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (updates: TaskOrderUpdate[]) => Promise<void>;

  // Filters
  filterByStatus: (status: TaskStatus) => Task[];
  filterByObjective: (objectiveId: string) => Task[];
  filterByDate: (filter: DateFilter) => Task[];
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic updates
  const createTask = async (data: CreateTaskInput) => {
    const tempId = `temp-${Date.now()}`;
    const tempTask = { ...data, id: tempId, createdAt: new Date() };

    setTasks(prev => [...prev, tempTask]);

    try {
      const task = await apiClient.tasks.create(data);
      setTasks(prev => prev.map(t => t.id === tempId ? task : t));
      return task;
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw err;
    }
  };

  // ... other methods

  return (
    <TaskContext.Provider value={{ tasks, loading, error, createTask, ... }}>
      {children}
    </TaskContext.Provider>
  );
}
```

### Local State with React Hooks

```typescript
// hooks/useTask.ts

export function useTask(taskId: string) {
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const task = tasks.find(t => t.id === taskId);

  const [isEditing, setIsEditing] = useState(false);
  const [localChanges, setLocalChanges] = useState<Partial<Task>>({});

  const saveChanges = async () => {
    if (task && Object.keys(localChanges).length > 0) {
      await updateTask(task.id, localChanges);
      setLocalChanges({});
      setIsEditing(false);
    }
  };

  return {
    task,
    isEditing,
    localChanges,
    setLocalChanges,
    saveChanges,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => {
      setLocalChanges({});
      setIsEditing(false);
    },
  };
}
```

---

## Offline & Sync Strategy

### IndexedDB Storage

```typescript
// lib/offline-storage.ts

import { openDB, DBSchema } from 'idb';

interface LifeAlignDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-user': string; 'by-updated': number };
  };
  objectives: {
    key: string;
    value: Objective;
    indexes: { 'by-user': string };
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      action: 'create' | 'update' | 'delete';
      entity: 'task' | 'objective';
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

export async function getDB() {
  return openDB<LifeAlignDB>('lifealign', 1, {
    upgrade(db) {
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-user', 'userId');
      taskStore.createIndex('by-updated', 'updatedAt');

      const objectiveStore = db.createObjectStore('objectives', { keyPath: 'id' });
      objectiveStore.createIndex('by-user', 'userId');

      const syncStore = db.createObjectStore('syncQueue', {
        keyPath: 'id',
        autoIncrement: true
      });
      syncStore.createIndex('by-timestamp', 'timestamp');
    },
  });
}
```

### Sync Strategy

```typescript
// lib/sync.ts

export class SyncManager {
  private syncInProgress = false;
  private db: IDBDatabase;

  async queueAction(action: SyncAction) {
    const db = await getDB();
    await db.add('syncQueue', {
      action: action.type,
      entity: action.entity,
      data: action.data,
      timestamp: Date.now(),
    });

    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  async sync() {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    const db = await getDB();

    try {
      const queue = await db.getAllFromIndex('syncQueue', 'by-timestamp');

      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          await db.delete('syncQueue', item.id);
        } catch (err) {
          console.error('Failed to sync item:', item, err);
          // Keep in queue for retry
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: SyncQueueItem) {
    switch (item.action) {
      case 'create':
        return this.syncCreate(item);
      case 'update':
        return this.syncUpdate(item);
      case 'delete':
        return this.syncDelete(item);
    }
  }

  // ... implementation
}
```

### Conflict Resolution

```typescript
// Conflict resolution strategy: Last-Write-Wins (LWW)

interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge';
  resolver: (local: Task, remote: Task) => Task;
}

const conflictResolver: ConflictResolution = {
  strategy: 'server-wins', // Default strategy for MVP
  resolver: (local, remote) => {
    // Server version takes precedence
    return remote;
  }
};
```

---

## Performance Optimization

### Code Splitting

```typescript
// app/(dashboard)/layout.tsx

import dynamic from 'next/dynamic';

// Lazy load heavy components
const ObjectiveGrid = dynamic(() => import('@/components/objectives/ObjectiveGrid'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Client-side only for interactive features
});

const TaskFilters = dynamic(() => import('@/components/tasks/TaskFilters'), {
  loading: () => <div>Loading filters...</div>
});
```

### Virtual Scrolling

```typescript
// components/tasks/TaskList.tsx

import { useVirtualizer } from '@tanstack/react-virtual';

export function TaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated task item height
    overscan: 5, // Render 5 items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TaskItem task={tasks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="LifeAlign"
  width={120}
  height={40}
  priority // For above-the-fold images
/>
```

### Memoization

```typescript
// Memoize expensive calculations
import { useMemo } from 'react';

function TaskDashboard({ tasks }: { tasks: Task[] }) {
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETE').length,
    overdue: tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETE'
    ).length,
  }), [tasks]);

  return <StatsDisplay stats={stats} />;
}
```

### Database Query Optimization

```typescript
// Use select to limit returned fields
const tasks = await prisma.task.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    status: true,
    dueDate: true,
    objectiveId: true,
    // Exclude notes to reduce payload
  },
  take: 50, // Limit results
  orderBy: { order: 'asc' }
});

// Use aggregations for counts
const objectiveWithStats = await prisma.objective.findUnique({
  where: { id },
  include: {
    _count: {
      select: {
        tasks: true,
      }
    },
    tasks: {
      where: { status: 'COMPLETE' },
      select: { id: true }
    }
  }
});
```

---

## Security

### Input Validation

```typescript
// lib/validation.ts

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  objectiveId: z.string().cuid().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE']).optional(),
});

export const createObjectiveSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Usage in API route
export async function POST(req: Request) {
  const body = await req.json();
  const validated = createTaskSchema.parse(body); // Throws if invalid

  // ... create task
}
```

### SQL Injection Prevention

```typescript
// Prisma ORM provides parameterized queries automatically
// Never construct raw SQL strings with user input

// ✅ SAFE - Prisma parameterizes automatically
const tasks = await prisma.task.findMany({
  where: {
    title: { contains: userInput } // Prisma handles escaping
  }
});

// ❌ DANGEROUS - Never do this
// const tasks = await prisma.$queryRaw`SELECT * FROM tasks WHERE title LIKE '%${userInput}%'`
```

### XSS Prevention

```typescript
// React escapes by default
// Tailwind classes don't execute JavaScript

// ✅ SAFE
<div>{task.title}</div>

// ❌ DANGEROUS - Avoid dangerouslySetInnerHTML unless absolutely necessary
// <div dangerouslySetInnerHTML={{ __html: task.notes }} />

// If HTML rendering is needed, sanitize first
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(task.notes)
}} />
```

### CSRF Protection

```typescript
// NextAuth.js provides CSRF tokens automatically
// Ensure all state-changing requests use POST/PATCH/DELETE
// Never use GET for mutations

// API routes automatically verify CSRF tokens
// No additional configuration needed
```

### Environment Variables

```bash
# .env.local (never commit to git)

DATABASE_URL="postgresql://user:password@localhost:5432/lifealign"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Production
# NEXTAUTH_URL="https://lifealign.app"
```

### Rate Limiting

```typescript
// lib/rate-limit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return { success, limit, reset, remaining };
}

// Usage in API route
export async function POST(req: Request) {
  const userId = await getAuthenticatedUser(req);
  const { success } = await checkRateLimit(userId);

  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // ... process request
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/components/TaskItem.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '@/components/tasks/TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: '1',
    title: 'Test task',
    status: 'NOT_STARTED',
    dueDate: new Date('2025-11-01'),
  };

  it('renders task title', () => {
    render(<TaskItem task={mockTask} onUpdate={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('calls onUpdate when checkbox clicked', () => {
    const onUpdate = jest.fn();
    render(<TaskItem task={mockTask} onUpdate={onUpdate} onDelete={jest.fn()} />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onUpdate).toHaveBeenCalledWith('1', { status: 'COMPLETE' });
  });
});
```

### Integration Tests (Playwright)

```typescript
// e2e/task-management.spec.ts

import { test, expect } from '@playwright/test';

test('user can create and complete a task', async ({ page }) => {
  await page.goto('/login');

  // Login
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/today');

  // Create task
  await page.fill('input[placeholder*="Add a task"]', 'Buy groceries');
  await page.press('input[placeholder*="Add a task"]', 'Enter');

  // Verify task appears
  await expect(page.getByText('Buy groceries')).toBeVisible();

  // Complete task
  await page.click('input[type="checkbox"]:near(:text("Buy groceries"))');

  // Verify completed state
  await expect(page.getByText('Buy groceries')).toHaveCSS('text-decoration', /line-through/);
});
```

### API Tests

```typescript
// __tests__/api/tasks.test.ts

import { POST } from '@/app/api/tasks/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue('user-123'),
}));

describe('POST /api/tasks', () => {
  it('creates a new task', async () => {
    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test task',
        dueDate: '2025-11-01T00:00:00Z',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.task.title).toBe('Test task');

    // Verify in database
    const task = await prisma.task.findUnique({
      where: { id: data.task.id }
    });
    expect(task).toBeTruthy();
  });

  it('validates required fields', async () => {
    const request = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical user flows
- **E2E Tests:** Core features (create, update, delete tasks/objectives)

---

## Deployment

### Vercel Deployment Configuration

```json
// vercel.json

{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  }
}
```

### Environment Setup

**Development:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Build:**
```bash
npm run build
npm run start
```

**Database Migrations:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Database Hosting

**Recommended:** Vercel Postgres, Supabase, or Neon
- Managed PostgreSQL
- Automatic backups
- Connection pooling
- SSL enabled

```bash
# Vercel Postgres setup
npx vercel postgres create lifealign-db
npx vercel env pull .env.local
```

---

## Development Environment

### Prerequisites

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- **PostgreSQL:** 15.x or higher (local dev)
- **Git:** Latest version

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/lifealign.git
cd lifealign

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed (optional)

# Run development server
npm run dev
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "type-check": "tsc --noEmit"
  }
}
```

### VSCode Configuration

```json
// .vscode/settings.json

{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Git Hooks (Husky)

```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test
```

---

## File Structure

```
lifealign/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .husky/
│   ├── pre-commit
│   └── pre-push
├── .vscode/
│   └── settings.json
├── public/
│   ├── icons/
│   └── images/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── styles/
├── __tests__/
│   ├── components/
│   ├── api/
│   └── utils/
├── e2e/
│   └── *.spec.ts
├── .env.example
├── .env.local (gitignored)
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── next.config.js
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Third-Party Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",

    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",

    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^1.0.0",
    "bcryptjs": "^2.4.3",

    "zod": "^3.22.0",
    "date-fns": "^3.0.0",

    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",

    "@tanstack/react-virtual": "^3.0.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/bcryptjs": "^2.4.0",

    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",

    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",

    "@playwright/test": "^1.40.0",

    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### Optional Dependencies (Future)

```json
{
  "dependencies": {
    "@upstash/ratelimit": "^1.0.0",  // Rate limiting
    "@upstash/redis": "^1.0.0",      // Redis cache
    "framer-motion": "^10.0.0",      // Animations
    "@dnd-kit/core": "^6.0.0",       // Drag and drop
    "react-hook-form": "^7.0.0"      // Form management
  }
}
```

---

## Performance Metrics & Monitoring

### Lighthouse Goals

- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 90+

### Core Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Monitoring Strategy

```typescript
// lib/analytics.ts

export function reportWebVitals({ id, name, value }: Metric) {
  // Send to analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ id, name, value }),
  });
}

// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // Send to monitoring service (e.g., Vercel Analytics)
}
```

---

## Migration Strategy

### Phase 1: Core Setup (Week 1)
- Initialize Next.js project
- Setup Prisma with PostgreSQL
- Configure NextAuth.js
- Create base layout and routing

### Phase 2: Task Management (Week 2-3)
- Implement task CRUD operations
- Build TaskList and TaskItem components
- Add filtering and sorting
- Implement quick-add functionality

### Phase 3: Objectives (Week 4)
- Create objective management
- Build ObjectiveCard and ObjectiveGrid
- Link tasks to objectives
- Add progress tracking

### Phase 4: Views & Navigation (Week 5)
- Implement Today view
- Build All Tasks view
- Create Inbox view
- Add mobile navigation

### Phase 5: Offline & PWA (Week 6)
- Setup IndexedDB storage
- Implement sync manager
- Add offline detection
- Configure PWA manifest

### Phase 6: Polish & Testing (Week 7-8)
- Add progressive prompts
- Implement dark mode
- Write tests (unit + E2E)
- Performance optimization
- Bug fixes

### Phase 7: Beta Launch (Week 9)
- Deploy to production
- Monitor metrics
- Gather user feedback
- Iterate

---

## Appendix

### Color Palette

```typescript
// tailwind.config.ts - Custom colors

colors: {
  brand: {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    // ... tailwind defaults
  }
}
```

### Typography Scale

```typescript
fontSize: {
  'xs': '0.75rem',     // 12px
  'sm': '0.875rem',    // 14px
  'base': '1rem',      // 16px
  'lg': '1.125rem',    // 18px
  'xl': '1.25rem',     // 20px
  '2xl': '1.5rem',     // 24px
  '3xl': '1.875rem',   // 30px
  '4xl': '2.25rem',    // 36px
}
```

### Spacing System

```typescript
spacing: {
  // 4px base unit
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '5': '1.25rem',   // 20px
  '6': '1.5rem',    // 24px
  '8': '2rem',      // 32px
  '10': '2.5rem',   // 40px
}
```

---

**Document Control**

- **Author:** Engineering Team
- **Reviewers:** Product, Design, QA
- **Approval Required:** Tech Lead, Engineering Manager
- **Next Review:** After Phase 2 completion
- **Version History:**
  - v1.0 (Oct 30, 2025) - Initial draft
