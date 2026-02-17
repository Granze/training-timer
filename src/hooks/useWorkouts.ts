import { useState, useEffect, useCallback } from 'react';
import { Workout } from '@/types';

const STORAGE_KEY = 'training-timer-workouts';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load workouts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Workout[];
        setWorkouts(parsed);
      }
    } catch (error) {
      console.error('Failed to load workouts from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
      } catch (error) {
        console.error('Failed to save workouts to localStorage:', error);
      }
    }
  }, [workouts, isLoaded]);

  const addWorkout = useCallback((workout: Workout) => {
    setWorkouts(prev => [...prev, workout]);
  }, []);

  const updateWorkout = useCallback((updatedWorkout: Workout) => {
    setWorkouts(prev =>
      prev.map(w =>
        w.id === updatedWorkout.id
          ? { ...updatedWorkout, updatedAt: new Date().toISOString() }
          : w
      )
    );
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  const getWorkout = useCallback(
    (id: string) => {
      return workouts.find(w => w.id === id) || null;
    },
    [workouts]
  );

  return {
    workouts,
    isLoaded,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkout,
  };
}
