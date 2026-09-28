import { useState, useEffect, useCallback } from 'react';
import { Workout, Exercise, RangeValue } from '@/types';

const STORAGE_KEY = 'training-timer-workouts';

function isValidRangeValue(value: unknown): value is RangeValue {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as RangeValue;
  return (
    typeof v.min === 'number' && isFinite(v.min) &&
    typeof v.max === 'number' && isFinite(v.max) &&
    typeof v.raw === 'string'
  );
}

function isValidExercise(value: unknown): value is Exercise {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Exercise;
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.repetitions === 'string' &&
    isValidRangeValue(e.series) &&
    isValidRangeValue(e.workTime) &&
    isValidRangeValue(e.restBetweenSeries) &&
    isValidRangeValue(e.restBetweenExercises)
  );
}

function isValidWorkout(value: unknown): value is Workout {
  if (typeof value !== 'object' || value === null) return false;
  const w = value as Workout;
  return (
    typeof w.id === 'string' &&
    typeof w.name === 'string' &&
    typeof w.createdAt === 'string' &&
    typeof w.updatedAt === 'string' &&
    Array.isArray(w.exercises) &&
    w.exercises.every(isValidExercise)
  );
}

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

  return {
    workouts,
    isLoaded,
    addWorkout,
    updateWorkout,
    deleteWorkout,
  };
}
