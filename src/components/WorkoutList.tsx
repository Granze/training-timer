import { Workout } from '@/types';
import { Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Moon, Sun, Play, Trash2 } from 'lucide-react';

interface WorkoutListProps {
  workouts: Workout[];
  onNewWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onStartWorkout: (workout: Workout) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function WorkoutList({
  workouts,
  onNewWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onStartWorkout,
  theme,
  onToggleTheme,
}: WorkoutListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: '"Bungee Shade", cursive' }}>Training Timer</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleTheme}
              variant="outline"
              size="lg"
              className="py-6 px-4"
              title={theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </Button>
            <Button
              onClick={onNewWorkout}
              size="lg"
              className="text-lg px-6 py-6"
            >
              + Nuovo
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                Nessun workout salvato
              </p>
              <p className="text-muted-foreground mb-6">
                Crea un nuovo workout o importa da CSV
              </p>
              <Button onClick={onNewWorkout} size="lg" className="text-lg px-8 py-6">
                Crea Workout
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="grid gap-4">
                {workouts.map((workout) => (
                  <Card key={workout.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{workout.name}</CardTitle>
                      <CardDescription>
                        {workout.exercises.length} esercizi •{' '}
                        {formatDate(workout.updatedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => onStartWorkout(workout)}
                          size="lg"
                          className="flex-1 min-w-[120px] text-lg py-6"
                        >
                          <Play className="w-5 h-5 mr-2" /> Avvia
                        </Button>
                        <Button
                          onClick={() => onEditWorkout(workout)}
                          variant="outline"
                          size="lg"
                          className="flex-1 min-w-[120px] text-lg py-6"
                        >
                          Modifica
                        </Button>
                        <Button
                          onClick={() => onDeleteWorkout(workout.id)}
                          variant="destructive"
                          size="lg"
                          className="text-lg py-6 px-6"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
}
