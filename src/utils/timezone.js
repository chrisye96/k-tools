export function isIntlSupported() {
  return typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined';
}

export function detectUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getHourInTimezoneAt(ianaTimezone, date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    hour: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === 'hour');
  return parseInt(hourPart.value, 10) % 24;
}

export function formatTimeInTimezone(ianaTimezone, date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ianaTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function getDayInTimezone(ianaTimezone, date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    weekday: 'long',
  }).format(date);
}

export function getUTCOffset(ianaTimezone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  return tzPart ? tzPart.value : '';
}

export function getRelativeOffset(fromTimezone, toTimezone, date = new Date()) {
  const getOffsetMinutes = (tz) => {
    const tzTime = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const utcTime = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    return (tzTime - utcTime) / 60000;
  };

  const diff = (getOffsetMinutes(toTimezone) - getOffsetMinutes(fromTimezone)) / 60;
  if (diff === 0) return 'Same time';
  const sign = diff > 0 ? '+' : '';
  const hours = Number.isInteger(diff) ? diff : diff.toFixed(1);
  return `${sign}${hours}h`;
}

export function findCitiesAtHour(cities, targetHour, now = new Date()) {
  return cities.filter((city) => {
    try {
      return getHourInTimezoneAt(city.timezone, now) === targetHour;
    } catch {
      return false;
    }
  });
}
