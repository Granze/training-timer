import { Exercise } from '@/types';

export function formatExerciseSummary(exercise: Exercise): string {
  const isTempo = exercise.repetitions.toLowerCase() === 'tempo';
  const isTimed = isTempo && exercise.workTime.max > 0;
  const rest =
    exercise.restBetweenSeries.max > 0
      ? exercise.restBetweenSeries
      : exercise.restBetweenExercises.max > 0
        ? exercise.restBetweenExercises
        : null;
  const reps = isTimed ? `${exercise.workTime.raw}s` : isTempo ? 'a tempo' : exercise.repetitions;
  return `${exercise.series.raw}×${reps}${rest ? ` • ${rest.raw}s` : ''}`;
}
