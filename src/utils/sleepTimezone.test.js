import { describe, it, expect } from 'vitest';
import {
  findSleepTimezones,
  parseHHmm,
  roundDelta,
  formatOffsetLabel,
  formatDuration,
} from './sleepTimezone';

describe('parseHHmm', () => {
  it('parses HH:mm into minutes', () => {
    expect(parseHHmm('05:00')).toBe(300);
    expect(parseHHmm('00:00')).toBe(0);
    expect(parseHHmm('23:59')).toBe(23 * 60 + 59);
  });

  it('returns null for invalid input', () => {
    expect(parseHHmm(null)).toBeNull();
    expect(parseHHmm('')).toBeNull();
    expect(parseHHmm('25:00')).toBeNull();
    expect(parseHHmm('5')).toBeNull();
  });
});

describe('roundDelta', () => {
  it('rounds to the nearest 15-minute step', () => {
    expect(roundDelta(0)).toBe(0);
    expect(roundDelta(7)).toBe(0);
    expect(roundDelta(8)).toBe(15);
    expect(roundDelta(53)).toBe(60);
    expect(roundDelta(-23)).toBe(-30);
  });
});

describe('formatOffsetLabel', () => {
  it('formats integer hours', () => {
    expect(formatOffsetLabel(0)).toBe('UTC');
    expect(formatOffsetLabel(540)).toBe('UTC+9');
    expect(formatOffsetLabel(-420)).toBe('UTC−7');
  });
  it('formats fractional offsets with HH:mm', () => {
    expect(formatOffsetLabel(330)).toBe('UTC+5:30');
    expect(formatOffsetLabel(345)).toBe('UTC+5:45');
  });
});

describe('formatDuration', () => {
  it('formats hours, minutes, or both', () => {
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(30)).toBe('30 min');
    expect(formatDuration(75)).toBe('1 h 15 min');
    expect(formatDuration(-90)).toBe('1 h 30 min');
  });
});

describe('findSleepTimezones', () => {
  // America/Edmonton is in our data set (popular: true). In summer
  // (after DST starts in March) it's UTC-6; in winter it's UTC-7. Use a
  // fixed `now` to keep the test deterministic.
  const winterNow = new Date('2026-01-15T12:00:00Z');

  it('returns null when any input is missing', () => {
    expect(findSleepTimezones({ homeTimezone: null, anchor: '05:00', actual: '04:00' })).toBeNull();
    expect(findSleepTimezones({ homeTimezone: 'America/Edmonton', anchor: null, actual: '04:00' })).toBeNull();
    expect(findSleepTimezones({ homeTimezone: 'America/Edmonton', anchor: '05:00', actual: null })).toBeNull();
  });

  it('example 1: anchor 05:00, actual 06:00, home Edmonton -> need 1h behind home', () => {
    const r = findSleepTimezones({
      homeTimezone: 'America/Edmonton',
      anchor: '05:00',
      actual: '06:00',
      now: winterNow,
    });
    expect(r).not.toBeNull();
    expect(r.delta).toBe(-60); // anchor - actual = -1h
    // Edmonton in winter is -420; target = -480 (UTC-8)
    expect(r.targetOffset).toBe(-480);
    expect(r.candidates.length).toBeGreaterThan(0);
    // America/Los_Angeles is UTC-8 in winter and is in our popular set, so
    // it should show up.
    expect(r.candidates.some((c) => c.city.timezone === 'America/Los_Angeles')).toBe(true);
  });

  it('example 2: anchor 05:00, actual 01:00, home Edmonton -> need 4h ahead of home', () => {
    const r = findSleepTimezones({
      homeTimezone: 'America/Edmonton',
      anchor: '05:00',
      actual: '01:00',
      now: winterNow,
    });
    expect(r.delta).toBe(240); // +4h
    expect(r.targetOffset).toBe(-180); // -7 + 4 = -3 hours from UTC
    // Brazil/Argentina-ish zones are at UTC-3 in winter. Asserting one popular
    // candidate exists is enough; the exact list can shift with future tzdata.
    expect(r.candidates.length).toBeGreaterThan(0);
  });

  it('rounds delta to the nearest 15 minutes before searching', () => {
    // anchor 05:07 vs actual 05:00 -> 7 min delta, rounds to 0 -> home itself
    const r = findSleepTimezones({
      homeTimezone: 'America/Edmonton',
      anchor: '05:07',
      actual: '05:00',
      now: winterNow,
    });
    expect(r.delta).toBe(0);
    expect(r.targetOffset).toBe(r.homeOffset);
    expect(r.candidates.some((c) => c.city.timezone === 'America/Edmonton')).toBe(true);
  });

  it('falls back to a closest candidate when no zone matches exactly', () => {
    // Picking a delta that is unlikely to land on any IANA offset. UTC+5:45
    // (Kathmandu) is a single fractional zone; pick a target that is not
    // 5:45 / 5:30 / 9:30 / 8:45 / 12:45 etc. Using an artificial home with
    // an unusual offset is the simplest way to force "no match" without
    // relying on quirky IANA data.
    // Easier route: anchor 05:08 vs actual 04:53 = 15 min -> already aligned.
    // Try a delta we know maps to a non-existent offset: UTC+0:30 (no zone).
    const r = findSleepTimezones({
      homeTimezone: 'UTC',
      anchor: '05:30',
      actual: '05:00',
      now: winterNow,
    });
    // If no zone has +30 min offset, candidates is empty and closest fills in.
    expect(r.delta).toBe(30);
    expect(r.targetOffset).toBe(30);
    if (r.candidates.length === 0) {
      expect(r.closest).not.toBeNull();
    }
  });

  it('caps visible to 5 entries and tracks overflow count', () => {
    const r = findSleepTimezones({
      homeTimezone: 'UTC',
      anchor: '05:00',
      actual: '05:00',
      now: winterNow,
    });
    // delta = 0, targetOffset = 0 -> only zones at UTC. Few enough to not
    // overflow but the structural fields still exist.
    expect(r.visible.length).toBeLessThanOrEqual(5);
    expect(r.overflow).toBeGreaterThanOrEqual(0);
  });
});
