'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'esquematiza_hero_countdown_deadline';
const DURATION_MS = 8 * 60 * 60 * 1000;

export type Remaining = {
  hours: number;
  minutes: number;
  seconds: number;
} | null;

export function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function useCountdown(): Remaining {
  const [remaining, setRemaining] = useState<Remaining>(null);

  useEffect(() => {
    let deadline: number;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;

    if (Number.isFinite(parsed) && parsed > Date.now()) {
      deadline = parsed;
    } else {
      deadline = Date.now() + DURATION_MS;
      window.localStorage.setItem(STORAGE_KEY, String(deadline));
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
      if (diff <= 0) {
        const next = Date.now() + DURATION_MS;
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return remaining;
}
