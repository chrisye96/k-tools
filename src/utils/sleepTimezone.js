import { cities } from '../data/cities';
import { getOffsetMinutes } from './timezone';

const ROUND_TO = 15; // IANA's finest resolution is 15 min (Nepal +5:45)
const MAX_RESULTS = 5;

export function parseHHmm(value) {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function roundDelta(min, step = ROUND_TO) {
  return Math.round(min / step) * step;
}

/**
 * Wrap an arbitrary signed minute count into the shortest equivalent delta in
 * the [-720, 720] range. Picking 23:00 actual + 01:00 anchor should produce
 * +120 (not -1320).
 */
function shortestDelta(min) {
  let d = min;
  while (d > 720) d -= 1440;
  while (d <= -720) d += 1440;
  return d;
}

/**
 * Given a home timezone + the user's actual bedtime + their game anchor time,
 * return the IANA zones whose current offset is exactly home + (anchor - actual).
 *
 * Falls back to a single closest candidate (smallest |targetOffset - candidateOffset|)
 * when no zone matches the target offset to the rounded minute.
 */
export function findSleepTimezones({ homeTimezone, anchor, actual, now = new Date() }) {
  if (!homeTimezone || !anchor || !actual) return null;

  const anchorMin = parseHHmm(anchor);
  const actualMin = parseHHmm(actual);
  if (anchorMin == null || actualMin == null) return null;

  const delta = roundDelta(shortestDelta(anchorMin - actualMin));
  const homeOffset = getOffsetMinutes(homeTimezone, now);
  const targetOffset = homeOffset + delta;

  const offsets = cities.map((city) => ({
    city,
    offset: getOffsetMinutes(city.timezone, now),
  }));

  const exact = offsets.filter((o) => o.offset === targetOffset);
  exact.sort((a, b) => {
    if (a.city.popular && !b.city.popular) return -1;
    if (!a.city.popular && b.city.popular) return 1;
    return a.city.city.localeCompare(b.city.city);
  });

  let closest = null;
  if (exact.length === 0) {
    let minDiff = Infinity;
    for (const o of offsets) {
      const diff = Math.abs(o.offset - targetOffset);
      if (diff < minDiff || (diff === minDiff && o.city.popular && !closest?.city.popular)) {
        minDiff = diff;
        closest = o;
      }
    }
  }

  return {
    delta,
    homeOffset,
    targetOffset,
    candidates: exact,
    closest,
    visible: exact.slice(0, MAX_RESULTS),
    overflow: Math.max(0, exact.length - MAX_RESULTS),
  };
}

export function formatOffsetLabel(min) {
  if (min === 0) return 'UTC';
  const ahead = min > 0;
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0
    ? `UTC${ahead ? '+' : '−'}${h}`
    : `UTC${ahead ? '+' : '−'}${h}:${String(m).padStart(2, '0')}`;
}

export function formatDuration(min) {
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
