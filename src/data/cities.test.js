import { describe, it, expect } from 'vitest';
import { cities, findCityByTimezone } from './cities';

describe('cities', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThan(100);
  });

  it('each city has required fields', () => {
    cities.forEach((city) => {
      expect(typeof city.timezone).toBe('string');
      expect(typeof city.city).toBe('string');
      expect(typeof city.country).toBe('string');
      expect(typeof city.label).toBe('string');
      expect(typeof city.popular).toBe('boolean');
    });
  });

  it('popular cities appear before non-popular cities', () => {
    const firstNonPopularIndex = cities.findIndex((c) => !c.popular);
    const lastPopularIndex = [...cities].reverse().findIndex((c) => c.popular);
    const lastPopularFromStart = cities.length - 1 - lastPopularIndex;
    expect(firstNonPopularIndex).toBeGreaterThan(0);
    expect(lastPopularFromStart).toBeLessThan(firstNonPopularIndex);
  });

  it('includes Calgary (America/Edmonton) in popular cities', () => {
    const calgary = cities.find((c) => c.timezone === 'America/Edmonton');
    expect(calgary).toBeDefined();
    expect(calgary.popular).toBe(true);
  });
});

describe('findCityByTimezone', () => {
  it('returns city for known timezone', () => {
    const result = findCityByTimezone('America/New_York');
    expect(result).not.toBeNull();
    expect(result.timezone).toBe('America/New_York');
  });

  it('returns null for unknown timezone', () => {
    expect(findCityByTimezone('Fake/Zone')).toBeNull();
  });
});
