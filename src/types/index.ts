// Range value that can be a single number or a range like "8-12"
export interface RangeValue {
  min: number;
  max: number;
  raw: string; // original CSV value for display
}

export interface Exercise {
  id: string;
  name: string;              // Esercizio
  series: RangeValue;        // Serie - e.g. 2-3
  repetitions: string;       // Ripetizioni - can be number range or "tempo"
  workTime: RangeValue;      // Tempo Lavoro (s) - e.g. 24-36
  restBetweenSeries: RangeValue;    // Recupero Serie (s)
  restBetweenExercises: RangeValue; // Recupero Esercizio (s)
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

// During execution, concrete values picked from ranges
export interface ExerciseExecution {
  exercise: Exercise;
  currentSeries: number;
  totalSeries: number;
  workTimeSec: number;
  restSeriesSec: number;
  restExerciseSec: number;
}

export type AppScreen = 'home' | 'editor' | 'player';

export interface AppState {
  currentScreen: AppScreen;
  currentWorkout: Workout | null;
  workouts: Workout[];
}
