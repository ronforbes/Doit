'use client';

import { Objective } from '@/types';
import { formatObjectiveDate } from '@/lib/date-utils';
import Link from 'next/link';

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const completedCount = objective.completedTaskCount || 0;
  const totalCount = objective.taskCount || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Link href={`/objectives/${objective.id}`}>
      <div
        className="bg-white rounded-xl shadow-sm border-t-4 p-6 cursor-pointer transition-all hover:shadow-md h-full flex flex-col"
        style={{ borderTopColor: objective.color }}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {objective.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            {formatObjectiveDate(objective.startDate, objective.targetDate)}
          </p>

          {objective.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{objective.description}</p>
          )}
        </div>

        <div>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-semibold" style={{ color: objective.color }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: objective.color,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{totalCount}</span> tasks
            </span>
            <span className="text-gray-600">
              <span className="font-semibold text-brand-green">{completedCount}</span> complete
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
