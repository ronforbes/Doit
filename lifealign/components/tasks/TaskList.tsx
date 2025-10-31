'use client';

import { Task } from '@/types';
import { TaskItem } from './TaskItem';
import { EmptyState } from '@/components/shared/EmptyState';

interface TaskListProps {
  tasks: Task[];
  showObjective?: boolean;
  emptyMessage?: string;
  groupByObjective?: boolean;
}

export function TaskList({
  tasks,
  showObjective = true,
  emptyMessage = 'No tasks yet',
  groupByObjective = false,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Create a task to get started"
        icon={
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      />
    );
  }

  if (groupByObjective) {
    // Group tasks by objective
    const grouped = tasks.reduce((acc, task) => {
      const key = task.objective?.title || 'No Objective';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([objectiveTitle, objectiveTasks]) => (
          <div key={objectiveTitle}>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-4 lg:px-0">
              {objectiveTitle} ({objectiveTasks.length})
            </h3>
            <div className="space-y-3">
              {objectiveTasks.map((task) => (
                <TaskItem key={task.id} task={task} showObjective={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} showObjective={showObjective} />
      ))}
    </div>
  );
}
