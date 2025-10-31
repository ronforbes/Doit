'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useObjectiveContext } from '@/contexts/ObjectiveContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';
import { TaskList } from '@/components/tasks/TaskList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatObjectiveDate } from '@/lib/date-utils';
import Link from 'next/link';

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectiveId = params.id as string;

  const { getObjectiveById, deleteObjective } = useObjectiveContext();
  const { tasks, loading: tasksLoading } = useTaskContext();

  const objective = getObjectiveById(objectiveId);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!objective && !tasksLoading) {
      router.push('/objectives');
    }
  }, [objective, tasksLoading, router]);

  const objectiveTasks = tasks.filter((task) => task.objectiveId === objectiveId);
  const completedTasks = objectiveTasks.filter((task) => task.status === 'COMPLETE');
  const progress =
    objectiveTasks.length > 0
      ? Math.round((completedTasks.length / objectiveTasks.length) * 100)
      : 0;

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this objective? Tasks will not be deleted but will be unlinked.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteObjective(objectiveId);
      router.push('/objectives');
    } catch (error) {
      console.error('Failed to delete objective:', error);
      alert('Failed to delete objective');
      setIsDeleting(false);
    }
  };

  if (!objective || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/objectives" className="text-brand-blue hover:underline">
          ← Back to Objectives
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-block w-4 h-4 rounded mr-3 mb-1"
          style={{ backgroundColor: objective.color }}
        />
        <h1 className="inline text-3xl lg:text-4xl font-bold text-gray-900">{objective.title}</h1>

        {objective.description && (
          <p className="text-gray-600 mt-4">{objective.description}</p>
        )}

        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <span>{formatObjectiveDate(objective.startDate, objective.targetDate)}</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">
            {objective.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-2xl font-bold" style={{ color: objective.color }}>
            {progress}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: objective.color,
            }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{objectiveTasks.length} total tasks</span>
          <span>{completedTasks.length} completed</span>
        </div>
      </div>

      {/* Quick Add */}
      <div className="mb-8">
        <TaskQuickAdd
          defaultObjectiveId={objectiveId}
          placeholder="Add a task for this objective..."
        />
      </div>

      {/* Tasks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
        <TaskList
          tasks={objectiveTasks}
          showObjective={false}
          emptyMessage="No tasks for this objective yet"
        />
      </div>

      {/* Actions */}
      <div className="border-t pt-6">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Objective'}
        </button>
      </div>
    </div>
  );
}
