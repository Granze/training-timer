import { useState } from 'react';
import { Workout, AppScreen } from '@/types';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTheme } from '@/hooks/useTheme';
import { WorkoutList } from '@/components/WorkoutList';
import { WorkoutEditor } from '@/components/WorkoutEditor';
import { WorkoutPlayer } from '@/components/WorkoutPlayer';
import { SharedWorkout } from '@/components/SharedWorkout';
import { hasShareHash, getSharedWorkoutFromHash } from '@/lib/share';
import { Toaster } from 'sonner';

function App() {
  const { workouts, isLoaded, addWorkout, updateWorkout, deleteWorkout, restoreWorkout } = useWorkouts();
  const { theme, toggleTheme, isLoaded: themeLoaded } = useTheme();
  // undefined = no share link, null = invalid share link, Workout = valid shared workout
  const [sharedWorkout, setSharedWorkout] = useState<Workout | null | undefined>(() =>
    hasShareHash(window.location.hash)
      ? getSharedWorkoutFromHash(window.location.hash)
      : undefined
  );
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() =>
    sharedWorkout !== undefined ? 'share' : 'home'
  );
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

  const clearShareHash = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  const handleNewWorkout = () => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name: 'New Workout',
      exercises: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentWorkout(newWorkout);
    setCurrentScreen('editor');
  };

  const handleEditWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentScreen('editor');
  };

  const handleSaveWorkout = (workout: Workout) => {
    if (workouts.find(w => w.id === workout.id)) {
      updateWorkout(workout);
    } else {
      addWorkout(workout);
    }
    setCurrentWorkout(null);
    setCurrentScreen('home');
  };

  const handleStartWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentScreen('player');
  };

  const handleBack = () => {
    setCurrentWorkout(null);
    setCurrentScreen('home');
  };

  // Persist every edit immediately, so nothing is lost if the tab is closed
  const handleUpdateWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    const exists = workouts.some(w => w.id === workout.id);
    if (exists) {
      updateWorkout(workout);
    } else if (workout.exercises.length > 0) {
      addWorkout(workout);
    }
  };

  const handleWorkoutComplete = () => {
    setCurrentWorkout(null);
    setCurrentScreen('home');
  };

  const handleSaveShared = (workout: Workout) => {
    if (!workouts.some(w => w.id === workout.id)) {
      addWorkout({ ...workout, updatedAt: new Date().toISOString() });
    }
  };

  const handleStartShared = (workout: Workout) => {
    const existing = workouts.find(w => w.id === workout.id);
    setCurrentWorkout(existing ?? workout);
    clearShareHash();
    setSharedWorkout(undefined);
    setCurrentScreen('player');
  };

  const handleBackFromShare = () => {
    clearShareHash();
    setSharedWorkout(undefined);
    setCurrentScreen('home');
  };

  const isSharedAlreadySaved =
    sharedWorkout != null && workouts.some(w => w.id === sharedWorkout.id);

  if (!isLoaded || !themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'home' && (
        <WorkoutList
          workouts={workouts}
          onNewWorkout={handleNewWorkout}
          onEditWorkout={handleEditWorkout}
          onDeleteWorkout={deleteWorkout}
          onRestoreWorkout={restoreWorkout}
          onStartWorkout={handleStartWorkout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'editor' && currentWorkout && (
        <WorkoutEditor
          workout={currentWorkout}
          onSave={handleSaveWorkout}
          onStart={handleStartWorkout}
          onBack={handleBack}
          onUpdate={handleUpdateWorkout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'player' && currentWorkout && (
        <WorkoutPlayer
          workout={currentWorkout}
          onComplete={handleWorkoutComplete}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'share' && (
        <SharedWorkout
          workout={sharedWorkout ?? null}
          alreadySaved={isSharedAlreadySaved}
          onStart={handleStartShared}
          onSave={handleSaveShared}
          onBack={handleBackFromShare}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      <Toaster theme={theme} position="bottom-center" richColors />
    </div>
  );
}

export default App;
