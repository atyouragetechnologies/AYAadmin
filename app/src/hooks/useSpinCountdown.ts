import { useState, useEffect } from 'react';
import { getMsToMidnightIST, getTodayIST } from '../utils/spinLimit';

/**
 * Returns a live HH:MM:SS countdown string to the next midnight IST.
 * Updates every second. Extracted from MoodWheel so both the map button
 * and the wheel share identical logic.
 */
export const useSpinCountdown = (): string => {
  const fmt = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const [timeLeft, setTimeLeft] = useState(() => fmt(getMsToMidnightIST()));

  useEffect(() => {
    let wasResetTriggered = false;

    const tick = () => {
      const ms = getMsToMidnightIST();
      if (ms <= 1000 && !wasResetTriggered) {
        wasResetTriggered = true;
        try {
          localStorage.setItem('aya_vibe_spins', JSON.stringify({ count: 0, date: getTodayIST() }));
        } catch {}
        window.dispatchEvent(new CustomEvent('aya-spins-reset'));
      } else if (ms > 2000) {
        wasResetTriggered = false;
      }
      setTimeLeft(fmt(ms));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
};
