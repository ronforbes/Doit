'use client';

import { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';

interface TaskQuickAddProps {
  defaultObjectiveId?: string;
  placeholder?: string;
  onTaskCreated?: () => void;
}

export function TaskQuickAdd({
  defaultObjectiveId,
  placeholder = 'Add a task...',
  onTaskCreated,
}: TaskQuickAddProps) {
  const { createTask } = useTaskContext();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createTask({
        title: title.trim(),
        objectiveId: defaultObjectiveId || null,
      });

      setTitle('');
      onTaskCreated?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent transition-all">
        <span className="text-brand-blue text-xl">+</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-base border-none focus:outline-none placeholder-gray-400"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}
