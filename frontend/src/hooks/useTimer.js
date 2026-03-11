import { useEffect, useState } from "react";

const DEFAULT_SECONDS = 45 * 60;

export function useTimer(key = "default-timer", initialSeconds = DEFAULT_SECONDS) {
  const storageKey = `timer:${key}`;
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const stored = Number(localStorage.getItem(storageKey));
    return Number.isFinite(stored) && stored > 0 ? stored : initialSeconds;
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, secondsLeft]);

  useEffect(() => {
    localStorage.setItem(storageKey, String(secondsLeft));
    if (secondsLeft === 0) setIsActive(false);
  }, [secondsLeft, storageKey]);

  const reset = () => {
    setSecondsLeft(initialSeconds);
    setIsActive(true);
  };

  return { secondsLeft, isActive, pause: () => setIsActive(false), resume: () => setIsActive(true), reset };
}
