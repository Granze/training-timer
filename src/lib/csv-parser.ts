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
    throw new Error('CSV file must have at least a header row and one data row');
  }
  
  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const headerMap = mapHeaders(headers);
  
  const exercises: Exercise[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: values[headerMap.exercise] || '',
      series: parseRangeValue(values[headerMap.series] || '1'),
      repetitions: values[headerMap.repetitions] || '',
      workTime: parseRangeValue(values[headerMap.workTime] || '0'),
      restBetweenSeries: parseRangeValue(values[headerMap.restSeries] || '0'),
      restBetweenExercises: parseRangeValue(values[headerMap.restExercise] || '0'),
    };
    
    exercises.push(exercise);
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
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
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
  ].join(',');
  
  const rows = exercises.map(ex => [
    ex.name,
    ex.series.raw,
    ex.repetitions,
    ex.workTime.raw,
    ex.restBetweenSeries.raw,
    ex.restBetweenExercises.raw,
  ].join(','));
  
  return [header, ...rows].join('\n');
}
