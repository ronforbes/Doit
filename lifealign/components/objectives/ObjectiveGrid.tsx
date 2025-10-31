'use client';

import { Objective } from '@/types';
import { ObjectiveCard } from './ObjectiveCard';
import { EmptyState } from '@/components/shared/EmptyState';

interface ObjectiveGridProps {
  objectives: Objective[];
  onCreateClick?: () => void;
}

export function ObjectiveGrid({ objectives, onCreateClick }: ObjectiveGridProps) {
  if (objectives.length === 0) {
    return (
      <EmptyState
        title="No objectives yet"
        description="Create your first objective to start aligning your tasks with your goals"
        action={
          onCreateClick
            ? {
                label: 'Create Objective',
                onClick: onCreateClick,
              }
            : undefined
        }
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
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objectives.map((objective) => (
        <ObjectiveCard key={objective.id} objective={objective} />
      ))}

      {/* Add new objective card */}
      {onCreateClick && objectives.length < 5 && (
        <button
          onClick={onCreateClick}
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 cursor-pointer transition-all hover:border-brand-blue hover:shadow-md flex flex-col items-center justify-center min-h-[200px] text-gray-500 hover:text-brand-blue"
        >
          <svg
            className="w-12 h-12 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="font-semibold">Add New Objective</span>
          <span className="text-sm mt-1">Define a new strategic goal</span>
        </button>
      )}
    </div>
  );
}
