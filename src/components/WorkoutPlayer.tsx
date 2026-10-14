import { useState, useEffect, useCallback } from 'react';
import { Workout, Exercise, RangeValue } from '@/types';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/useTimer';
import { getDefaultRangeValue } from '@/lib/range';
import { X, Trophy, Play, Check, Pause } from 'lucide-react';

type PlayerPhase = 'exercise' | 'work-timer' | 'rest-series' | 'rest-exercise' | 'complete';

const ZERO_RANGE: RangeValue = { min: 0, max: 0, raw: '0' };
const DEFAULT_SERIES_RANGE: RangeValue = { min: 1, max: 1, raw: '1' };

function isTimedExercise(exercise: Exercise): boolean {
  return exercise.repetitions.toLowerCase() === 'tempo' && exercise.workTime.max > 0;
}

interface WorkoutPlayerProps {
  workout: Workout;
  onComplete: () => void;
  onBack: () => void;
}

export function WorkoutPlayer({ workout, onComplete, onBack }: WorkoutPlayerProps) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSeries, setCurrentSeries] = useState(1);
  const [phase, setPhase] = useState<PlayerPhase>('exercise');

  const currentExercise = workout.exercises[exerciseIndex] as Exercise | undefined;
  const totalSeries = Math.max(1, getDefaultRangeValue(currentExercise?.series ?? DEFAULT_SERIES_RANGE));
  const workTime = getDefaultRangeValue(currentExercise?.workTime ?? ZERO_RANGE);
  const restSeries = getDefaultRangeValue(currentExercise?.restBetweenSeries ?? ZERO_RANGE);
  const restExercise = getDefaultRangeValue(currentExercise?.restBetweenExercises ?? ZERO_RANGE);
  const isTimed = currentExercise ? isTimedExercise(currentExercise) : false;

  const nextExerciseCandidate = workout.exercises[exerciseIndex + 1] as Exercise | undefined;
  const nextExercise =
    nextExerciseCandidate !== undefined &&
    (phase === 'rest-exercise' ||
      (phase === 'rest-series' && currentSeries === totalSeries && restExercise === 0))
      ? nextExerciseCandidate
      : undefined;

  const handleTimerComplete = useCallback(() => {
    playBeep();
    vibrate();
  }, []);

  const { time, isRunning, isPaused, start, pause, resume, skip } = useTimer({
    onComplete: handleTimerComplete,
  });

  // Advance the state machine after a phase finishes (user action, skip or timer end)
  const advance = useCallback((finishedPhase: PlayerPhase) => {
    if (finishedPhase === 'exercise' && isTimed) {
      setPhase('work-timer');
      start(workTime);
      return;
    }

    if (finishedPhase === 'exercise' || finishedPhase === 'work-timer') {
      if (currentSeries < totalSeries) {
        if (restSeries > 0) {
          setPhase('rest-series');
          start(restSeries);
        } else {
          setCurrentSeries((s) => s + 1);
          setPhase('exercise');
        }
      } else if (exerciseIndex < workout.exercises.length - 1) {
        if (restExercise > 0) {
          setPhase('rest-exercise');
          start(restExercise);
        } else {
          setExerciseIndex((i) => i + 1);
          setCurrentSeries(1);
          setPhase('exercise');
        }
      } else {
        setPhase('complete');
      }
      return;
    }

    if (finishedPhase === 'rest-series') {
      setCurrentSeries((s) => s + 1);
      setPhase('exercise');
      return;
    }

    if (finishedPhase === 'rest-exercise') {
      if (exerciseIndex < workout.exercises.length - 1) {
        setExerciseIndex((i) => i + 1);
        setCurrentSeries(1);
        setPhase('exercise');
      } else {
        setPhase('complete');
      }
    }
  }, [currentSeries, totalSeries, exerciseIndex, workout.exercises.length, restSeries, restExercise, isTimed, workTime, start]);

  // Handle done button during exercise
  const handleDone = () => {
    advance('exercise');
  };

  // Handle skip button during rest
  const handleSkipRest = () => {
    skip();
    advance(phase);
  };

  // Auto-advance when timer completes
  useEffect(() => {
    if (time === 0 && !isRunning && (phase === 'work-timer' || phase === 'rest-series' || phase === 'rest-exercise')) {
      // Small delay before auto-advancing
      const timeout = setTimeout(() => advance(phase), 500);
      return () => clearTimeout(timeout);
    }
  }, [time, isRunning, phase, advance]);

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-muted-foreground mb-6">
          Questo workout non contiene esercizi.
        </p>
        <Button onClick={onBack} size="lg" className="text-xl py-8 px-12">
          Indietro
        </Button>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6"><Trophy className="w-24 h-24 mx-auto" /></div>
          <h1 className="text-4xl font-bold mb-4">Workout Completato!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {workout.name}
          </p>
          <Button onClick={onComplete} size="lg" className="text-xl py-8 px-12">
            Fine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button onClick={onBack} variant="outline" size="lg" className="py-6">
            <X className="w-5 h-5 mr-2" /> Esci
          </Button>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Esercizio {exerciseIndex + 1}/{workout.exercises.length}
            </div>
            <div className="font-semibold">{workout.name}</div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {phase === 'exercise' && (
          <ExerciseDisplay
            exercise={currentExercise}
            currentSeries={currentSeries}
            totalSeries={totalSeries}
            onDone={handleDone}
          />
        )}

        {(phase === 'work-timer' || phase === 'rest-series' || phase === 'rest-exercise') && (
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            isPaused={isPaused}
            phase={phase}
            exercise={currentExercise}
            currentSeries={currentSeries}
            totalSeries={totalSeries}
            onPause={pause}
            onResume={resume}
            onSkip={handleSkipRest}
            nextExercise={nextExercise}
          />
        )}
      </main>
    </div>
  );
}

// Exercise Display Component
interface ExerciseDisplayProps {
  exercise: Exercise;
  currentSeries: number;
  totalSeries: number;
  onDone: () => void;
}

function ExerciseDisplay({ exercise, currentSeries, totalSeries, onDone }: ExerciseDisplayProps) {
  const isTimed = isTimedExercise(exercise);

  return (
    <div className="text-center w-full max-w-lg">
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-2">Serie {currentSeries}/{totalSeries}</div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">{exercise.name}</h2>

        <div className="bg-muted rounded-2xl p-6 mb-8">
          {isTimed ? (
            <>
              <div className="text-sm text-muted-foreground mb-1">TEMPO</div>
              <div className="text-5xl font-bold">{exercise.workTime.raw}s</div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-1">RIPETIZIONI</div>
              <div className="text-5xl font-bold">{exercise.repetitions}</div>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={onDone}
        size="lg"
        className="w-full text-2xl py-10 px-8 rounded-2xl"
      >
        {isTimed ? <><Play className="w-6 h-6 mr-2" /> INIZIA</> : <><Check className="w-6 h-6 mr-2" /> FATTO</>}
      </Button>
    </div>
  );
}

// Timer Display Component
interface TimerDisplayProps {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  phase: PlayerPhase;
  exercise: Exercise;
  currentSeries: number;
  totalSeries: number;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  nextExercise?: Exercise;
}

function TimerDisplay({
  time,
  isRunning,
  isPaused,
  phase,
  exercise,
  currentSeries,
  totalSeries,
  onPause,
  onResume,
  onSkip,
  nextExercise,
}: TimerDisplayProps) {
  const getPhaseLabel = () => {
    switch (phase) {
      case 'work-timer':
        return 'LAVORO';
      case 'rest-series':
        return 'RECUPERO SERIE';
      case 'rest-exercise':
        return 'RECUPERO ESERCIZIO';
      default:
        return '';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'work-timer':
        return 'text-green-500';
      case 'rest-series':
      case 'rest-exercise':
        return 'text-orange-500';
      default:
        return '';
    }
  };

  const totalTime = phase === 'work-timer'
    ? exercise.workTime.max
    : phase === 'rest-series'
      ? exercise.restBetweenSeries.max
      : exercise.restBetweenExercises.max;

  const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * 100 : 0;

  return (
    <div className="text-center w-full max-w-lg">
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1">
          {phase !== 'work-timer' && `Serie ${currentSeries}/${totalSeries}`}
        </div>
        <h2 className="text-2xl font-bold">{exercise.name}</h2>
      </div>

      <div className="relative mb-8">
        {/* Circular progress */}
        <svg className="w-64 h-64 mx-auto transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className={getPhaseColor()}
            strokeLinecap="round"
          />
        </svg>

        {/* Timer content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-1">{getPhaseLabel()}</div>
          <div className={`text-7xl font-bold ${getPhaseColor()}`}>
            {time}
          </div>
          <div className="text-sm text-muted-foreground">secondi</div>
        </div>
      </div>

      <div className="flex gap-3">
        {phase !== 'work-timer' && (
          <Button
            onClick={onSkip}
            variant="outline"
            size="lg"
            className="flex-1 text-lg py-6"
          >
            Salta
          </Button>
        )}
        <Button
          onClick={isPaused ? onResume : onPause}
          size="lg"
          className="flex-1 text-lg py-6"
          disabled={!isRunning}
        >
          {isPaused ? <><Play className="w-5 h-5 mr-2" /> Riprendi</> : <><Pause className="w-5 h-5 mr-2" /> Pausa</>}
        </Button>
      </div>

      {nextExercise && <NextExerciseCard exercise={nextExercise} />}
    </div>
  );
}

function NextExerciseCard({ exercise }: { exercise: Exercise }) {
  const isTimed = isTimedExercise(exercise);

  return (
    <div className="bg-muted rounded-xl px-4 py-3 mt-6 flex items-baseline justify-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">PROSSIMO:</span>
      <span className="text-lg font-bold">{exercise.name}</span>
      <span className="text-sm text-muted-foreground">
        {exercise.series.raw} serie × {isTimed ? `${exercise.workTime.raw}s` : exercise.repetitions}
      </span>
    </div>
  );
}

// Audio feedback
function playBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.onended = () => {
      audioContext.close().catch(() => {});
    };

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Vibration feedback
function vibrate() {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}
