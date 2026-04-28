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

/**
 * Returns the timezone's offset from UTC in minutes at the given moment.
 * Honours DST automatically because it parses Intl's longOffset output.
 * Examples:
 *   getOffsetMinutes('UTC')          ->    0
 *   getOffsetMinutes('Asia/Tokyo')   ->  540  (+9:00)
 *   getOffsetMinutes('Asia/Kolkata') ->  330  (+5:30)
 *   getOffsetMinutes('Asia/Kathmandu') -> 345 (+5:45)
 *   getOffsetMinutes('America/Edmonton', winterDate) -> -420 (-7:00, MST)
 */
export function getOffsetMinutes(ianaTimezone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (!tzPart) return 0;
    // longOffset emits "GMT", "GMT+05:30", "GMT-07:00", "UTC+9", etc.
    const m = /(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/.exec(tzPart.value);
    if (!m) return 0;
    const sign = m[1] === '+' ? 1 : -1;
    const h = parseInt(m[2], 10);
    const min = parseInt(m[3] ?? '0', 10);
    return sign * (h * 60 + min);
  } catch {
    return 0;
  }
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
