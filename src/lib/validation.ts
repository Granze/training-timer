import { Workout, Exercise, RangeValue } from '@/types';

export function isValidRangeValue(value: unknown): value is RangeValue {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as RangeValue;
  return (
    typeof v.min === 'number' && isFinite(v.min) &&
    typeof v.max === 'number' && isFinite(v.max) &&
    typeof v.raw === 'string'
  );
}

export function isValidExercise(value: unknown): value is Exercise {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Exercise;
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.repetitions === 'string' &&
    isValidRangeValue(e.series) &&
    isValidRangeValue(e.workTime) &&
    isValidRangeValue(e.restBetweenSeries) &&
    isValidRangeValue(e.restBetweenExercises) &&
    (e.note === undefined || typeof e.note === 'string')
  );
}

export function isValidWorkout(value: unknown): value is Workout {
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
