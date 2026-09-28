import { RangeValue } from '@/types';

/**
 * Parse a value that can be a single number or a range like "8-12"
 * Returns a RangeValue with min, max, and raw string
 */
export function parseRangeValue(value: string): RangeValue {
  const trimmed = value.trim();
  
  // Check if it's a range (e.g., "8-12")
  const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return { min, max, raw: trimmed };
  }
  
  // Try to parse as single number
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    return { min: num, max: num, raw: trimmed };
  }
  
  // Return 0 for non-numeric values (like "tempo")
  return { min: 0, max: 0, raw: trimmed };
}

/**
 * Get the default value for a range (uses max)
 */
export function getDefaultRangeValue(range: RangeValue): number {
  return range.max;
}


