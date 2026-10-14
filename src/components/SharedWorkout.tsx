import { Workout } from '@/types';
import { Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { ExerciseSummaryList } from '@/components/ExerciseSummaryList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Moon, Sun, Play, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SharedWorkoutProps {
  workout: Workout | null;
  alreadySaved: boolean;
  onStart: (workout: Workout) => void;
  onSave: (workout: Workout) => void;
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function SharedWorkout({
  workout,
  alreadySaved,
  onStart,
  onSave,
  onBack,
  theme,
  onToggleTheme,
}: SharedWorkoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button onClick={onBack} variant="outline" size="lg" className="py-6">
            ← Indietro
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: '"Bungee Shade", cursive' }}>Training Timer</h1>
          <Button
            onClick={onToggleTheme}
            variant="outline"
            size="lg"
            className="py-6 px-4"
            title={theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {!workout ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                Link non valido
              </p>
              <p className="text-muted-foreground mb-6">
                Il link non contiene un workout valido o è danneggiato.
              </p>
              <Button onClick={onBack} size="lg" className="text-lg px-8 py-6">
                Vai alla home
              </Button>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Workout condiviso con te</CardDescription>
                <CardTitle className="text-xl">{workout.name}</CardTitle>
                <CardDescription>
                  {workout.exercises.length} esercizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workout.exercises.length > 0 && (
                  <ScrollArea className="max-h-[50vh]">
                    <ExerciseSummaryList exercises={workout.exercises} />
                  </ScrollArea>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onStart(workout)}
                    size="lg"
                    className="flex-1 min-w-[120px] text-lg py-6"
                    disabled={workout.exercises.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" /> Avvia ora
                  </Button>
                  {alreadySaved ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 min-w-[120px] text-lg py-6"
                      disabled
                    >
                      <Check className="w-5 h-5 mr-2" /> Già salvato
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        onSave(workout);
                        toast.success('Workout salvato nella tua libreria');
                      }}
                      variant="outline"
                      size="lg"
                      className="flex-1 min-w-[120px] text-lg py-6"
                    >
                      <Save className="w-5 h-5 mr-2" /> Salva workout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
