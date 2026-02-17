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

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setTime(seconds);
    remainingRef.current = seconds;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, seconds - elapsed);
      
      setTime(remaining);
      remainingRef.current = remaining;
      options.onTick?.(remaining);

      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        options.onComplete?.();
      }
    }, 100);
  }, [clearTimer, options]);

  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      clearTimer();
      setIsPaused(true);
    }
  }, [isRunning, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      startTimeRef.current = Date.now();
      const remaining = remainingRef.current;
      
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, remaining - elapsed);
        
        setTime(newRemaining);
        remainingRef.current = newRemaining;
        options.onTick?.(newRemaining);

        if (newRemaining <= 0) {
          clearTimer();
          setIsRunning(false);
          options.onComplete?.();
        }
      }, 100);
      
      setIsPaused(false);
    }
  }, [isRunning, isPaused, clearTimer, options]);

  const stop = useCallback(() => {
    clearTimer();
    setTime(0);
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
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
