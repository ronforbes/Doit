'use client';

import { useState, useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';
import { TaskList } from '@/components/tasks/TaskList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AllTasksPage() {
  const { tasks, loading } = useTaskContext();
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredTasks = useMemo(() => {
    if (showCompleted) {
      return tasks;
    }
    return tasks.filter((task) => task.status !== 'COMPLETE');
  }, [tasks, showCompleted]);

  const completedCount = tasks.filter((task) => task.status === 'COMPLETE').length;

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">All Tasks</h1>
            <p className="text-gray-600">
              {filteredTasks.length} {showCompleted ? 'total' : 'active'} tasks
            </p>
          </div>

          {completedCount > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showCompleted ? 'Hide' : 'Show'} Completed ({completedCount})
            </button>
          )}
        </div>
      </div>

      {/* Quick Add */}
      <div className="mb-8">
        <TaskQuickAdd />
      </div>

      {/* Tasks grouped by objective */}
      <TaskList tasks={filteredTasks} groupByObjective />
    </div>
  );
}
