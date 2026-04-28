import { describe, it, expect } from 'vitest';
import {
  detectUserTimezone,
  isIntlSupported,
  getHourInTimezoneAt,
  formatTimeInTimezone,
  getDayInTimezone,
  getUTCOffset,
  getOffsetMinutes,
  getRelativeOffset,
  findCitiesAtHour,
} from './timezone';

describe('isIntlSupported', () => {
  it('returns true in jsdom environment', () => {
    expect(isIntlSupported()).toBe(true);
  });
});

describe('detectUserTimezone', () => {
  it('returns a string with a slash (IANA format)', () => {
    const tz = detectUserTimezone();
    expect(typeof tz).toBe('string');
    expect(tz).toMatch(/\//);
  });
});

describe('getHourInTimezoneAt', () => {
  it('returns 13 for Europe/London at 12:00 UTC in June (BST = UTC+1)', () => {
    const noon = new Date('2024-06-15T12:00:00Z');
    expect(getHourInTimezoneAt('Europe/London', noon)).toBe(13);
  });

  it('returns 0 for midnight UTC in UTC zone', () => {
    const midnight = new Date('2024-01-15T00:00:00Z');
    expect(getHourInTimezoneAt('UTC', midnight)).toBe(0);
  });

  it('returns 21 for Asia/Tokyo at 12:00 UTC (UTC+9)', () => {
    const noon = new Date('2024-01-15T12:00:00Z');
    expect(getHourInTimezoneAt('Asia/Tokyo', noon)).toBe(21);
  });

  it('returns a number between 0 and 23', () => {
    const now = new Date();
    const hour = getHourInTimezoneAt('America/New_York', now);
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
  });
});

describe('formatTimeInTimezone', () => {
  it('returns a non-empty 24-hour HH:mm string', () => {
    const result = formatTimeInTimezone('UTC');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    expect(result).not.toMatch(/AM|PM/);
  });
});

describe('getDayInTimezone', () => {
  it('returns a long weekday name', () => {
    const day = getDayInTimezone('UTC');
    expect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).toContain(day);
  });
});

describe('getUTCOffset', () => {
  it('returns a non-empty string', () => {
    const offset = getUTCOffset('America/New_York');
    expect(typeof offset).toBe('string');
    expect(offset.length).toBeGreaterThan(0);
  });
});

describe('getOffsetMinutes', () => {
  it('returns 0 for UTC', () => {
    expect(getOffsetMinutes('UTC')).toBe(0);
  });

  it('returns +540 for Asia/Tokyo (UTC+9, no DST)', () => {
    expect(getOffsetMinutes('Asia/Tokyo')).toBe(540);
  });

  it('returns +330 for Asia/Kolkata (UTC+5:30 fractional)', () => {
    expect(getOffsetMinutes('Asia/Kolkata')).toBe(330);
  });

  it('returns +345 for Asia/Kathmandu (UTC+5:45 fractional)', () => {
    expect(getOffsetMinutes('Asia/Kathmandu')).toBe(345);
  });

  it('returns negative for America/Edmonton in winter', () => {
    const winter = new Date('2026-01-15T12:00:00Z');
    expect(getOffsetMinutes('America/Edmonton', winter)).toBe(-420);
  });
});

describe('getRelativeOffset', () => {
  it('returns "Same time" when timezones are equivalent', () => {
    expect(getRelativeOffset('America/New_York', 'America/New_York')).toBe('Same time');
  });

  it('returns positive offset when target is ahead', () => {
    const result = getRelativeOffset('America/New_York', 'Europe/London');
    expect(result).toMatch(/^\+/);
  });

  it('returns negative offset when target is behind', () => {
    const result = getRelativeOffset('Europe/London', 'America/New_York');
    expect(result).toMatch(/^-/);
  });
});

describe('formatTimeInTimezone with custom date', () => {
  it('formats time for a given Date object', () => {
    const noon = new Date('2024-01-15T12:00:00Z');
    const result = formatTimeInTimezone('UTC', noon);
    expect(result).toMatch(/12:00/);
  });
});

describe('getDayInTimezone with custom date', () => {
  it('returns correct weekday for a given date', () => {
    const monday = new Date('2024-01-15T12:00:00Z');
    expect(getDayInTimezone('UTC', monday)).toBe('Monday');
  });
});

describe('findCitiesAtHour', () => {
  const mockCities = [
    { timezone: 'UTC', label: 'UTC' },
    { timezone: 'Asia/Tokyo', label: 'Tokyo, Japan' },
    { timezone: 'America/New_York', label: 'New York, United States' },
  ];

  it('returns cities where hour matches target', () => {
    const fixedTime = new Date('2024-01-15T12:00:00Z');
    const result = findCitiesAtHour(mockCities, 12, fixedTime);
    expect(result).toHaveLength(1);
    expect(result[0].timezone).toBe('UTC');
  });

  it('returns empty array when no cities match', () => {
    const fixedTime = new Date('2024-01-15T12:00:00Z');
    const result = findCitiesAtHour(mockCities, 3, fixedTime);
    expect(result).toHaveLength(0);
  });

  it('handles invalid timezone gracefully', () => {
    const fixedTime = new Date('2024-01-15T12:00:00Z');
    const citiesWithBad = [{ timezone: 'Bad/Zone', label: 'Bad' }];
    expect(() => findCitiesAtHour(citiesWithBad, 12, fixedTime)).not.toThrow();
  });
});
