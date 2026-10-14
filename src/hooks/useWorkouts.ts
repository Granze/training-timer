import { useState, useEffect, useCallback } from 'react';
import { Workout } from '@/types';
import { isValidWorkout } from '@/lib/validation';
import { toast } from 'sonner';

const STORAGE_KEY = 'training-timer-workouts';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load workouts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isValidWorkout);
          if (valid.length !== parsed.length) {
            console.warn('Some stored workouts were invalid and have been discarded');
          }
          setWorkouts(valid);
        }
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
        toast.error('Impossibile salvare i dati: storage non disponibile o spazio esaurito.', {
          id: 'workouts-storage-error',
        });
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

  const restoreWorkout = useCallback((workout: Workout, index: number) => {
    setWorkouts(prev => {
      if (prev.some(w => w.id === workout.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, workout);
      return next;
    });
  }, []);

  return {
    workouts,
    isLoaded,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    restoreWorkout,
  };
}
