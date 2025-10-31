'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput, DateFilter, TaskStatus } from '@/types';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  filterByStatus: (status: TaskStatus) => Task[];
  filterByObjective: (objectiveId: string | null) => Task[];
  filterByDate: (filter: DateFilter) => Task[];
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch tasks');
      }

      setTasks(data.data.tasks);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: CreateTaskInput): Promise<Task> => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create task');
    }

    const newTask = result.data.task;
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to update task');
    }

    const updatedTask = result.data.task;
    setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
    return updatedTask;
  };

  const deleteTask = async (id: string): Promise<void> => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to delete task');
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const filterByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  const filterByObjective = (objectiveId: string | null): Task[] => {
    if (objectiveId === null) {
      return tasks.filter((task) => task.objectiveId === null);
    }
    return tasks.filter((task) => task.objectiveId === objectiveId);
  };

  const filterByDate = (filter: DateFilter): Task[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= weekEnd;
        });
      case 'overdue':
        return tasks.filter((task) => {
          if (!task.dueDate || task.status === 'COMPLETE') return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        });
      case 'none':
        return tasks.filter((task) => !task.dueDate);
      default:
        return tasks;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refreshTasks,
        filterByStatus,
        filterByObjective,
        filterByDate,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
