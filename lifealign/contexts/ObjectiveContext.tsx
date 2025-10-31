'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Objective, CreateObjectiveInput, UpdateObjectiveInput, ObjectiveStatus } from '@/types';

interface ObjectiveContextValue {
  objectives: Objective[];
  loading: boolean;
  error: Error | null;
  createObjective: (data: CreateObjectiveInput) => Promise<Objective>;
  updateObjective: (id: string, data: UpdateObjectiveInput) => Promise<Objective>;
  deleteObjective: (id: string) => Promise<void>;
  refreshObjectives: () => Promise<void>;
  getObjectiveById: (id: string) => Objective | undefined;
  filterByStatus: (status: ObjectiveStatus) => Objective[];
}

const ObjectiveContext = createContext<ObjectiveContextValue | undefined>(undefined);

export function ObjectiveProvider({ children }: { children: ReactNode }) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchObjectives = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/objectives');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch objectives');
      }

      setObjectives(data.data.objectives);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  const createObjective = async (data: CreateObjectiveInput): Promise<Objective> => {
    const response = await fetch('/api/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create objective');
    }

    const newObjective = result.data.objective;
    setObjectives((prev) => [...prev, newObjective]);
    return newObjective;
  };

  const updateObjective = async (id: string, data: UpdateObjectiveInput): Promise<Objective> => {
    const response = await fetch(`/api/objectives/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to update objective');
    }

    const updatedObjective = result.data.objective;
    setObjectives((prev) =>
      prev.map((objective) => (objective.id === id ? updatedObjective : objective))
    );
    return updatedObjective;
  };

  const deleteObjective = async (id: string): Promise<void> => {
    const response = await fetch(`/api/objectives/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to delete objective');
    }

    setObjectives((prev) => prev.filter((objective) => objective.id !== id));
  };

  const refreshObjectives = useCallback(async () => {
    await fetchObjectives();
  }, [fetchObjectives]);

  const getObjectiveById = (id: string): Objective | undefined => {
    return objectives.find((obj) => obj.id === id);
  };

  const filterByStatus = (status: ObjectiveStatus): Objective[] => {
    return objectives.filter((obj) => obj.status === status);
  };

  return (
    <ObjectiveContext.Provider
      value={{
        objectives,
        loading,
        error,
        createObjective,
        updateObjective,
        deleteObjective,
        refreshObjectives,
        getObjectiveById,
        filterByStatus,
      }}
    >
      {children}
    </ObjectiveContext.Provider>
  );
}

export function useObjectiveContext() {
  const context = useContext(ObjectiveContext);
  if (context === undefined) {
    throw new Error('useObjectiveContext must be used within an ObjectiveProvider');
  }
  return context;
}
