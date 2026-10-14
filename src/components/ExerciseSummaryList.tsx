import { Exercise } from '@/types';
import { formatExerciseSummary } from '@/lib/format';

interface ExerciseSummaryListProps {
  exercises: Exercise[];
}

export function ExerciseSummaryList({ exercises }: ExerciseSummaryListProps) {
  return (
    <ol className="mb-4 divide-y divide-border/60">
      {exercises.map((exercise, index) => (
        <li
          key={exercise.id}
          className="flex items-baseline justify-between gap-3 py-1.5"
        >
          <span className="text-sm font-medium truncate min-w-0">
            <span className="text-xs text-muted-foreground mr-2 tabular-nums">
              {index + 1}.
            </span>
            {exercise.name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            {formatExerciseSummary(exercise)}
          </span>
        </li>
      ))}
    </ol>
  );
}
