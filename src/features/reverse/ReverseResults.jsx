import { useMemo } from 'react';
import { findCitiesAtHour, formatTimeInTimezone, getDayInTimezone, getUTCOffset } from '../../utils/timezone';
import { cities } from '../../data/cities';
import './ReverseResults.css';

export default function ReverseResults({ targetHour, homeTimezone }) {
  const userDay = useMemo(() => {
    if (!homeTimezone) return null;
    return getDayInTimezone(homeTimezone);
  }, [homeTimezone]);

  const grouped = useMemo(() => {
    if (targetHour === null || targetHour === undefined) return null;
    const matches = findCitiesAtHour(cities, targetHour);
    return matches.reduce((acc, city) => {
      const offset = getUTCOffset(city.timezone);
      if (!acc[offset]) acc[offset] = [];
      acc[offset].push(city);
      return acc;
    }, {});
  }, [targetHour]);

  if (grouped === null) {
    return <p className="results-empty">Select a target time above to see results.</p>;
  }

  const entries = Object.entries(grouped);

  if (entries.length === 0) {
    return <p className="results-empty">No major cities found for this time.</p>;
  }

  return (
    <div className="reverse-results">
      {entries.map(([offset, groupCities]) => (
        <div key={offset} className="result-group">
          <div className="result-group__offset">{offset}</div>
          <div className="result-group__cities">
            {groupCities.map((city) => {
              const cityDay = getDayInTimezone(city.timezone);
              return (
                <div key={city.timezone} className="result-card">
                  <div className="result-card__city">{city.label}</div>
                  <div className="result-card__time">{formatTimeInTimezone(city.timezone)}</div>
                  {cityDay !== userDay && (
                    <div className="result-card__day">{cityDay}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
