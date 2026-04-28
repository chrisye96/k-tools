import { getTimeZones } from '@vvo/tzdb';

const POPULAR_TIMEZONES = new Set([
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Toronto',
  'America/Vancouver',
  'America/Edmonton',
  'America/Denver',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Zurich',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Helsinki',
  'Europe/Warsaw',
  'Europe/Lisbon',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Casablanca',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Manila',
  'Asia/Kuala_Lumpur',
  'Asia/Riyadh',
  'Asia/Tehran',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Guam',
]);

const rawTimezones = getTimeZones();

/**
 * The IANA zone name's last segment ("America/Edmonton" -> "Edmonton") is
 * the canonical name most users associate with the timezone, even when the
 * largest city under that zone has a different name. Prefer the segment
 * when it matches one of mainCities; otherwise fall back to the largest
 * city. Examples after this rule:
 *   America/Edmonton   -> Edmonton  (zone name matches mainCities[1])
 *   America/Los_Angeles -> Los Angeles (zone name matches mainCities[0])
 *   America/New_York   -> New York City (zone name "New York" doesn't equal
 *                        "New York City" exactly, falls back to mainCities[0])
 *   Asia/Kolkata       -> Kolkata   (zone name match)
 */
function pickCanonicalCity(tz) {
  const zoneCity = tz.name.split('/').pop().replace(/_/g, ' ');
  const match = tz.mainCities.find((c) => c.toLowerCase() === zoneCity.toLowerCase());
  return match ?? tz.mainCities[0];
}

export const cities = rawTimezones
  .filter((tz) => tz.mainCities && tz.mainCities.length > 0)
  .map((tz) => {
    const city = pickCanonicalCity(tz);
    return {
      timezone: tz.name,
      city,
      country: tz.countryName,
      label: `${city}, ${tz.countryName}`,
      searchable: tz.mainCities,
      popular: POPULAR_TIMEZONES.has(tz.name),
    };
  })
  .sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.city.localeCompare(b.city);
  });

export function findCityByTimezone(ianaName) {
  return cities.find((c) => c.timezone === ianaName) ?? null;
}
