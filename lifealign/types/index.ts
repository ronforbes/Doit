// Types for the application

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
export type ObjectiveStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultView?: 'today' | 'all' | 'objectives' | 'inbox';
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
  showCompletedTasks?: boolean;
  darkMode?: 'light' | 'dark' | 'system';
}

export interface Task {
  id: string;
  userId: string;
  objectiveId: string | null;
  title: string;
  notes: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  objective?: Objective;
}

export interface Objective {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: Date;
  targetDate: Date;
  status: ObjectiveStatus;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
  taskCount?: number;
  completedTaskCount?: number;
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  dueDate?: Date | string | null;
  objectiveId?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string | null;
  dueDate?: Date | string | null;
  objectiveId?: string | null;
  status?: TaskStatus;
  order?: number;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  startDate: Date | string;
  targetDate: Date | string;
  color?: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  description?: string | null;
  startDate?: Date | string;
  targetDate?: Date | string;
  status?: ObjectiveStatus;
  color?: string;
  order?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export type DateFilter = 'today' | 'week' | 'overdue' | 'none';
