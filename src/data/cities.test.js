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
      expect(Array.isArray(city.searchable)).toBe(true);
      expect(city.searchable.length).toBeGreaterThan(0);
    });
  });

  it('popular cities appear before non-popular cities', () => {
    const firstNonPopularIndex = cities.findIndex((c) => !c.popular);
    const lastPopularIndex = [...cities].reverse().findIndex((c) => c.popular);
    const lastPopularFromStart = cities.length - 1 - lastPopularIndex;
    expect(firstNonPopularIndex).toBeGreaterThan(0);
    expect(lastPopularFromStart).toBeLessThan(firstNonPopularIndex);
  });

  it('uses the IANA zone name as canonical when it matches a mainCity', () => {
    // America/Edmonton's mainCities[0] is Calgary, but the zone name match
    // promotes Edmonton.
    const edmonton = cities.find((c) => c.timezone === 'America/Edmonton');
    expect(edmonton).toBeDefined();
    expect(edmonton.city).toBe('Edmonton');
    expect(edmonton.label).toBe('Edmonton, Canada');
    expect(edmonton.popular).toBe(true);
  });

  it('falls back to mainCities[0] when the zone name does not match any mainCity', () => {
    // America/New_York's mainCities[0] is "New York City" (zone name "New York"
    // is not exactly equal so the fallback applies).
    const ny = cities.find((c) => c.timezone === 'America/New_York');
    expect(ny).toBeDefined();
    expect(ny.city).toBe('New York City');
  });

  it('keeps every mainCity in the searchable list so aliases are discoverable', () => {
    const edmonton = cities.find((c) => c.timezone === 'America/Edmonton');
    expect(edmonton.searchable).toEqual(expect.arrayContaining(['Calgary', 'Edmonton']));
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
