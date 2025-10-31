'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { useTaskContext } from '@/contexts/TaskContext';
import { Checkbox } from '@/components/ui/Checkbox';
import { formatTaskDate, isOverdue } from '@/lib/date-utils';

interface TaskItemProps {
  task: Task;
  showObjective?: boolean;
}

export function TaskItem({ task, showObjective = true }: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleCheckboxChange = async () => {
    const newStatus = task.status === 'COMPLETE' ? 'NOT_STARTED' : 'COMPLETE';
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTitleSave = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      try {
        await updateTask(task.id, { title: editTitle.trim() });
      } catch (error) {
        console.error('Failed to update task:', error);
        setEditTitle(task.title);
      }
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const isCompleted = task.status === 'COMPLETE';
  const isTaskOverdue = task.dueDate && !isCompleted && isOverdue(task.dueDate);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
        task.objective?.color ? '' : 'border-l-gray-300'
      }`}
      style={{
        borderLeftColor: task.objective?.color || undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox
            checked={isCompleted}
            onChange={handleCheckboxChange}
            className={isCompleted ? 'checked:bg-brand-green' : ''}
          />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }
              }}
              className="w-full text-base border-b-2 border-brand-blue focus:outline-none"
              autoFocus
            />
          ) : (
            <h3
              className={`text-base font-medium cursor-pointer ${
                isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
              onClick={() => !isCompleted && setIsEditing(true)}
            >
              {task.title}
            </h3>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {showObjective && task.objective && (
              <span
                className="inline-block px-2 py-1 text-xs font-semibold rounded"
                style={{
                  backgroundColor: `${task.objective.color}20`,
                  color: task.objective.color,
                }}
              >
                {task.objective.title}
              </span>
            )}

            {task.dueDate && (
              <span
                className={`text-xs font-medium ${
                  isTaskOverdue ? 'text-red-600' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {formatTaskDate(task.dueDate)}
              </span>
            )}

            {task.status === 'IN_PROGRESS' && !isCompleted && (
              <span className="text-xs font-semibold text-brand-blue">In Progress</span>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
