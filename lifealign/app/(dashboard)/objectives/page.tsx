'use client';

import { useState } from 'react';
import { useObjectiveContext } from '@/contexts/ObjectiveContext';
import { ObjectiveGrid } from '@/components/objectives/ObjectiveGrid';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ObjectivesPage() {
  const { objectives, loading, createObjective } = useObjectiveContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    targetDate: '',
    color: '#3b82f6',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeObjectives = objectives.filter((obj) => obj.status === 'ACTIVE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createObjective({
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        targetDate: new Date(formData.targetDate).toISOString(),
        color: formData.color,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        targetDate: '',
        color: '#3b82f6',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create objective:', error);
      alert('Failed to create objective. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Objectives</h1>
          <p className="text-gray-600">
            {activeObjectives.length} active objective{activeObjectives.length !== 1 ? 's' : ''} • Track
            your strategic goals
          </p>
        </div>

        {activeObjectives.length < 5 && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <span className="mr-2">+</span>
            New Objective
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Objective</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Launch Product"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this objective..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              <Input
                label="Target Date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-3">
                {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                Create Objective
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Objectives Grid */}
      <ObjectiveGrid
        objectives={activeObjectives}
        onCreateClick={activeObjectives.length < 5 ? () => setShowCreateForm(true) : undefined}
      />

      {activeObjectives.length >= 5 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          You've reached the maximum of 5 active objectives. Complete or archive an objective to
          create a new one.
        </div>
      )}
    </div>
  );
}
