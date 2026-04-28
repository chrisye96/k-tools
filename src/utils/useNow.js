import { useEffect, useState } from 'react';

/**
 * Returns a Date that updates on every minute boundary so live time
 * displays (favorite chips, result cards, big forward time) stay current
 * without a full page refresh. Intentionally aligned to the next wall-clock
 * minute so the UI flips at e.g. 12:01:00 rather than 60s after mount.
 *
 * Pause behaviour: when a referenceDate is in effect (time-travel mode),
 * callers should ignore this hook's value entirely; the picker freezes
 * results at the chosen instant.
 */
export default function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId;
    const msUntilNextMinute = intervalMs - (Date.now() % intervalMs);

    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), intervalMs);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [intervalMs]);

  return now;
}
