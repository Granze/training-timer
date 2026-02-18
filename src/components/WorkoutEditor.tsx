import { useState, useRef } from 'react';
import { Workout, Exercise } from '@/types';
import { Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { parseCSV } from '@/lib/csv-parser';
import { parseRangeValue } from '@/lib/range';
import { Moon, Sun, Folder, Play } from 'lucide-react';

interface WorkoutEditorProps {
  workout: Workout;
  onSave: (workout: Workout) => void;
  onStart: (workout: Workout) => void;
  onBack: () => void;
  onUpdate: (workout: Workout) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function WorkoutEditor({
  workout,
  onSave,
  onStart,
  onBack,
  onUpdate,
  theme,
  onToggleTheme,
}: WorkoutEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (name: string) => {
    onUpdate({ ...workout, name });
  };

  const handleAddExercise = (exercise: Exercise) => {
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, exercise],
    });
    setIsAddDialogOpen(false);
    setEditingExercise(null);
  };

  const handleUpdateExercise = (exercise: Exercise) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === exercise.id ? exercise : e
      ),
    });
    setEditingExercise(null);
  };

  const handleDeleteExercise = (id: string) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.filter((e) => e.id !== id),
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const exercises = parseCSV(content);
        onUpdate({
          ...workout,
          exercises: [...workout.exercises, ...exercises],
        });
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('Errore nel parsing del CSV. Controlla il formato.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const updated = {
      ...workout,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
  };

  const handleStart = () => {
    if (workout.exercises.length === 0) {
      alert('Aggiungi almeno un esercizio prima di iniziare.');
      return;
    }
    onStart(workout);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="lg" className="py-6">
            ← Indietro
          </Button>
          <Input
            value={workout.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-xl font-semibold border-0 focus-visible:ring-0 px-2 flex-1"
            placeholder="Nome workout"
          />
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
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-lg py-6 px-6">
                  + Aggiungi Esercizio
                </Button>
              </DialogTrigger>
              <ExerciseFormDialog
                exercise={null}
                onSave={handleAddExercise}
                onClose={() => setIsAddDialogOpen(false)}
              />
            </Dialog>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="text-lg py-6 px-6"
            >
              <Folder className="w-5 h-5 mr-2" /> Importa CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Exercise list */}
          {workout.exercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">
                Nessun esercizio. Aggiungi manualmente o importa da CSV.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="grid gap-3">
                {workout.exercises.map((exercise, index) => (
                  <Card key={exercise.id}>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-lg">
                        {index + 1}. {exercise.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="text-sm text-muted-foreground mb-3">
                        {exercise.series.raw} serie × {exercise.repetitions} rep
                        {exercise.workTime.max > 0 && (
                          <span> • Lavoro: {exercise.workTime.raw}s</span>
                        )}
                        {exercise.restBetweenSeries.max > 0 && (
                          <span> • Recupero: {exercise.restBetweenSeries.raw}s</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setEditingExercise(exercise)}
                              variant="outline"
                              size="sm"
                              className="py-5"
                            >
                              Modifica
                            </Button>
                          </DialogTrigger>
                          {editingExercise?.id === exercise.id && (
                            <ExerciseFormDialog
                              exercise={editingExercise}
                              onSave={handleUpdateExercise}
                              onClose={() => setEditingExercise(null)}
                            />
                          )}
                        </Dialog>
                        <Button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          variant="destructive"
                          size="sm"
                          className="py-5"
                        >
                          Elimina
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

      {/* Footer */}
      <footer className="p-4 sm:p-6 border-t">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            onClick={handleSave}
            variant="outline"
            size="lg"
            className="flex-1 text-lg py-6"
          >
            Salva
          </Button>
          <Button
            onClick={handleStart}
            size="lg"
            className="flex-1 text-lg py-6"
            disabled={workout.exercises.length === 0}
          >
            <Play className="w-5 h-5 mr-2" /> Avvia
          </Button>
        </div>
      </footer>
    </div>
  );
}

// Exercise Form Dialog Component
interface ExerciseFormDialogProps {
  exercise: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

function ExerciseFormDialog({ exercise, onSave, onClose }: ExerciseFormDialogProps) {
  const [form, setForm] = useState({
    name: exercise?.name || '',
    series: exercise?.series.raw || '',
    repetitions: exercise?.repetitions || '',
    workTime: exercise?.workTime.raw || '',
    restBetweenSeries: exercise?.restBetweenSeries.raw || '',
    restBetweenExercises: exercise?.restBetweenExercises.raw || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('Inserisci il nome dell\'esercizio');
      return;
    }

    const newExercise: Exercise = {
      id: exercise?.id || crypto.randomUUID(),
      name: form.name.trim(),
      series: parseRangeValue(form.series || '1'),
      repetitions: form.repetitions || '',
      workTime: parseRangeValue(form.workTime || '0'),
      restBetweenSeries: parseRangeValue(form.restBetweenSeries || '0'),
      restBetweenExercises: parseRangeValue(form.restBetweenExercises || '0'),
    };

    onSave(newExercise);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {exercise ? 'Modifica Esercizio' : 'Nuovo Esercizio'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <Label htmlFor="name" className="text-base">Nome Esercizio</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="es. Push-up"
            className="mt-1 py-3 text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="series" className="text-base">Serie</Label>
            <Input
              id="series"
              value={form.series}
              onChange={(e) => setForm({ ...form, series: e.target.value })}
              placeholder="es. 3 o 2-3"
              className="mt-1 py-3 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="repetitions" className="text-base">Ripetizioni</Label>
            <Input
              id="repetitions"
              value={form.repetitions}
              onChange={(e) => setForm({ ...form, repetitions: e.target.value })}
              placeholder="es. 8-12 o tempo"
              className="mt-1 py-3 text-lg"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="workTime" className="text-base">Tempo Lavoro (s)</Label>
          <Input
            id="workTime"
            value={form.workTime}
            onChange={(e) => setForm({ ...form, workTime: e.target.value })}
            placeholder="es. 30 o 20-40"
            className="mt-1 py-3 text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restSeries" className="text-base">Recupero Serie (s)</Label>
            <Input
              id="restSeries"
              value={form.restBetweenSeries}
              onChange={(e) => setForm({ ...form, restBetweenSeries: e.target.value })}
              placeholder="es. 60"
              className="mt-1 py-3 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="restExercise" className="text-base">Recupero Esercizio (s)</Label>
            <Input
              id="restExercise"
              value={form.restBetweenExercises}
              onChange={(e) => setForm({ ...form, restBetweenExercises: e.target.value })}
              placeholder="es. 90"
              className="mt-1 py-3 text-lg"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="lg"
            className="flex-1 py-6 text-lg"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1 py-6 text-lg"
          >
            {exercise ? 'Aggiorna' : 'Aggiungi'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
