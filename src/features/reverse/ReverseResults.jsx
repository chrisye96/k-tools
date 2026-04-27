import { useMemo } from 'react';
import { findCitiesAtHour, formatTimeInTimezone, getDayInTimezone, getUTCOffset } from '../../utils/timezone';
import { cities } from '../../data/cities';
import { useT } from '../../contexts/LanguageContext';
import './ReverseResults.css';

export default function ReverseResults({ targetHour, homeTimezone, referenceDate }) {
  const t = useT();
  const ref = referenceDate ?? new Date();

  const userDay = useMemo(() => {
    if (!homeTimezone) return null;
    return getDayInTimezone(homeTimezone, ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTimezone, referenceDate]);

  const grouped = useMemo(() => {
    if (targetHour === null || targetHour === undefined) return null;
    const matches = findCitiesAtHour(cities, targetHour, ref);
    return matches.reduce((acc, city) => {
      const offset = getUTCOffset(city.timezone, ref);
      if (!acc[offset]) acc[offset] = [];
      acc[offset].push(city);
      return acc;
    }, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetHour, referenceDate]);

  if (grouped === null) {
    return <p className="results-empty">{t('reverse.selectPrompt')}</p>;
  }

  const entries = Object.entries(grouped);

  if (entries.length === 0) {
    return <p className="results-empty">{t('reverse.empty')}</p>;
  }

  return (
    <div className="reverse-results">
      {entries.map(([offset, groupCities]) => (
        <div key={offset} className="result-group">
          <div className="result-group__offset">{offset}</div>
          <div className="result-group__cities">
            {groupCities.map((city) => {
              const cityDay = getDayInTimezone(city.timezone, ref);
              return (
                <div key={city.timezone} className="result-card">
                  <div className="result-card__city">{city.label}</div>
                  <div className="result-card__time">{formatTimeInTimezone(city.timezone, ref)}</div>
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
