import { useState } from 'react';
import { Workout, AppScreen } from '@/types';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTheme } from '@/hooks/useTheme';
import { WorkoutList } from '@/components/WorkoutList';
import { WorkoutEditor } from '@/components/WorkoutEditor';
import { WorkoutPlayer } from '@/components/WorkoutPlayer';

function App() {
  const { workouts, isLoaded, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { theme, toggleTheme, isLoaded: themeLoaded } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

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

  const handleWorkoutComplete = () => {
    setCurrentWorkout(null);
    setCurrentScreen('home');
  };

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
          onUpdate={setCurrentWorkout}
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
    </div>
  );
}

export default App;
