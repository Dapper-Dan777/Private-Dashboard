import { useEffect, useRef, useState } from "react";

type UseTimerOptions = {
  isActive: boolean;
  onTick?: (deltaSeconds: number) => void;
  initialSeconds?: number;
};

export const useTimer = ({
  isActive,
  onTick,
  initialSeconds = 0,
}: UseTimerOptions) => {
  // Isoliert Timer-Zustand und Tick-Logik fuer klare Trennung von UI/State.
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsRunning(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
      onTick?.(1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isRunning, onTick]);

  const start = () => {
    if (!isActive) {
      return;
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const setSecondsSafe = (value: number) => {
    setSeconds(Math.max(0, Math.floor(value)));
  };

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    setSeconds: setSecondsSafe,
  };
};
