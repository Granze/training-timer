import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Workout } from '@/types';
import { isValidWorkout } from '@/lib/validation';

const SHARE_HASH_PREFIX = '#share=';

interface SharePayload {
  v: 1;
  workout: Workout;
}

export function encodeWorkout(workout: Workout): string {
  const payload: SharePayload = { v: 1, workout };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeWorkout(encoded: string): Workout | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload: unknown = JSON.parse(json);
    if (typeof payload !== 'object' || payload === null) return null;
    const p = payload as Partial<SharePayload>;
    if (p.v !== 1) return null;
    return isValidWorkout(p.workout) ? p.workout : null;
  } catch {
    return null;
  }
}

// URLs above ~2000 chars may be truncated by some messaging apps
export const SHARE_URL_SAFE_LENGTH = 2000;

export function buildShareUrl(workout: Workout): { url: string; isLong: boolean } {
  const url = `${window.location.origin}${import.meta.env.BASE_URL}${SHARE_HASH_PREFIX}${encodeWorkout(workout)}`;
  return { url, isLong: url.length > SHARE_URL_SAFE_LENGTH };
}

export function hasShareHash(hash: string): boolean {
  return hash.startsWith(SHARE_HASH_PREFIX);
}

export function getSharedWorkoutFromHash(hash: string): Workout | null {
  if (!hasShareHash(hash)) return null;
  return decodeWorkout(hash.slice(SHARE_HASH_PREFIX.length));
}
