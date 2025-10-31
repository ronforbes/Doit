'use client';

import { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';
import { TaskList } from '@/components/tasks/TaskList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function InboxPage() {
  const { tasks, loading } = useTaskContext();

  const inboxTasks = useMemo(() => {
    return tasks.filter((task) => !task.objectiveId && task.status !== 'COMPLETE');
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
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Inbox</h1>
        <p className="text-gray-600">Tasks without objectives</p>
      </div>

      {/* Info Banner */}
      {inboxTasks.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Organize your tasks</h3>
              <p className="text-sm text-blue-800">
                Link these tasks to objectives to track your progress better. Click on a task to
                edit it and assign an objective.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add */}
      <div className="mb-8">
        <TaskQuickAdd placeholder="Add a task..." />
      </div>

      {/* Tasks */}
      <TaskList tasks={inboxTasks} showObjective={false} emptyMessage="No unlinked tasks" />
    </div>
  );
}
