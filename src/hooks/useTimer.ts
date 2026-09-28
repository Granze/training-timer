import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingRef = useRef<number>(0);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback((duration: number) => {
    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);

      if (remaining !== remainingRef.current) {
        remainingRef.current = remaining;
        setTime(remaining);
        optionsRef.current.onTick?.(remaining);
      }

      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        optionsRef.current.onComplete?.();
      }
    }, 100);
  }, [clearTimer]);

  const start = useCallback((seconds: number) => {
    clearTimer();
    remainingRef.current = seconds;
    setTime(seconds);
    setIsRunning(true);
    setIsPaused(false);
    startInterval(seconds);
  }, [clearTimer, startInterval]);

  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      clearTimer();
      setIsPaused(true);
    }
  }, [isRunning, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      startInterval(remainingRef.current);
      setIsPaused(false);
    }
  }, [isRunning, isPaused, startInterval]);

  const stop = useCallback(() => {
    clearTimer();
    remainingRef.current = 0;
    setTime(0);
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    remainingRef.current = 0;
    setIsRunning(false);
    setTime(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    skip,
  };
}
