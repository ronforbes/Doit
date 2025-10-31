'use client';

import { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';
import { TaskList } from '@/components/tasks/TaskList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';

export default function TodayPage() {
  const { tasks, loading } = useTaskContext();

  const { overdueTasks, todayTasks, inProgressTasks, completedToday } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.status === 'COMPLETE') return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    const dueToday = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && task.status !== 'COMPLETE';
    });

    const inProgress = tasks.filter(
      (task) => task.status === 'IN_PROGRESS' && !overdue.includes(task) && !dueToday.includes(task)
    );

    const completed = tasks.filter((task) => {
      if (task.status !== 'COMPLETE' || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    return {
      overdueTasks: overdue,
      todayTasks: dueToday,
      inProgressTasks: inProgress,
      completedToday: completed.length,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Today</h1>
        <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Quick Stats */}
      {completedToday > 0 && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Completed today</span>
              <span className="text-2xl font-bold text-brand-green">{completedToday}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add */}
      <div className="mb-8">
        <TaskQuickAdd placeholder="Add a task for today..." />
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4 px-4 lg:px-0">
            Overdue ({overdueTasks.length})
          </h2>
          <TaskList tasks={overdueTasks} />
        </div>
      )}

      {/* Due Today */}
      {todayTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 px-4 lg:px-0">
            Due Today ({todayTasks.length})
          </h2>
          <TaskList tasks={todayTasks} />
        </div>
      )}

      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 px-4 lg:px-0">
            In Progress ({inProgressTasks.length})
          </h2>
          <TaskList tasks={inProgressTasks} />
        </div>
      )}

      {/* Empty state */}
      {overdueTasks.length === 0 && todayTasks.length === 0 && inProgressTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks for today. You're all set! 🎉</p>
        </div>
      )}
    </div>
  );
}
