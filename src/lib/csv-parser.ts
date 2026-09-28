import { Exercise } from '@/types';
import { parseRangeValue } from './range';

// Italian CSV headers
const CSV_HEADERS = {
  exercise: 'Esercizio',
  series: 'Serie',
  repetitions: 'Ripetizioni',
  workTime: 'Tempo Lavoro (s)',
  restSeries: 'Recupero Serie (s)',
  restExercise: 'Recupero Esercizio (s)',
};

/**
 * Parse CSV content with Italian headers
 * Returns array of Exercise objects
 */
export function parseCSV(csvContent: string): Exercise[] {
  const lines = csvContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error('Il file CSV deve contenere una riga di intestazione e almeno una riga dati');
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const headerMap = mapHeaders(headers);

  if (headerMap.exercise === undefined) {
    throw new Error(`Intestazione obbligatoria mancante: "${CSV_HEADERS.exercise}"`);
  }

  const exercises: Exercise[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const name = values[headerMap.exercise]?.trim() ?? '';

    // Skip rows without an exercise name
    if (!name) continue;

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name,
      series: parseRangeValue(values[headerMap.series] || '1'),
      repetitions: values[headerMap.repetitions] || '',
      workTime: parseRangeValue(values[headerMap.workTime] || '0'),
      restBetweenSeries: parseRangeValue(values[headerMap.restSeries] || '0'),
      restBetweenExercises: parseRangeValue(values[headerMap.restExercise] || '0'),
    };

    exercises.push(exercise);
  }

  if (exercises.length === 0) {
    throw new Error('Nessun esercizio valido trovato nel file CSV');
  }

  return exercises;
}

/**
 * Map CSV headers to indices
 */
function mapHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  headers.forEach((header, index) => {
    const trimmed = header.trim();
    if (trimmed === CSV_HEADERS.exercise) map.exercise = index;
    else if (trimmed === CSV_HEADERS.series) map.series = index;
    else if (trimmed === CSV_HEADERS.repetitions) map.repetitions = index;
    else if (trimmed === CSV_HEADERS.workTime) map.workTime = index;
    else if (trimmed === CSV_HEADERS.restSeries) map.restSeries = index;
    else if (trimmed === CSV_HEADERS.restExercise) map.restExercise = index;
  });

  return map;
}

/**
 * Escape a field for CSV output (quotes, commas and newlines)
 */
function escapeCSVField(field: string): string {
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Convert exercises to CSV format
 */
export function exercisesToCSV(exercises: Exercise[]): string {
  const header = [
    CSV_HEADERS.exercise,
    CSV_HEADERS.series,
    CSV_HEADERS.repetitions,
    CSV_HEADERS.workTime,
    CSV_HEADERS.restSeries,
    CSV_HEADERS.restExercise,
  ].map(escapeCSVField).join(',');

  const rows = exercises.map(ex => [
    ex.name,
    ex.series.raw,
    ex.repetitions,
    ex.workTime.raw,
    ex.restBetweenSeries.raw,
    ex.restBetweenExercises.raw,
  ].map(escapeCSVField).join(','));

  return [header, ...rows].join('\n');
}

/**
 * Parse a CSV line handling quoted values and escaped quotes ("")
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}
