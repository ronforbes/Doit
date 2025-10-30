import { z } from 'zod';

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  objectiveId: z.string().cuid().optional().nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE']).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  notes: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  objectiveId: z.string().cuid().optional().nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE']).optional(),
  order: z.number().int().min(0).optional(),
});

export const bulkUpdateTasksSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
    })
  ),
});

// Objective validation schemas
export const createObjectiveSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
});

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  preferences: z
    .object({
      defaultView: z.enum(['today', 'all', 'objectives', 'inbox']).optional(),
      weekStartsOn: z.enum([0, 1]).optional(),
      showCompletedTasks: z.boolean().optional(),
      darkMode: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional(),
});
