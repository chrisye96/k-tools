import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { formatTimeInTimezone, getDayInTimezone, getUTCOffset, getRelativeOffset } from '../../utils/timezone';
import { useT } from '../../contexts/LanguageContext';
import useNow from '../../utils/useNow';
import './ForwardResult.css';

export default function ForwardResult({
  targetCity,
  homeTimezone,
  referenceDate,
  isFavorite,
  addFavorite,
  removeFavorite,
}) {
  const t = useT();
  const liveNow = useNow();
  const ref = referenceDate ?? liveNow;
  const canStar = typeof isFavorite === 'function';
  const tz = targetCity?.timezone;
  const starred = canStar && tz ? isFavorite(tz) : false;

  const time = useMemo(
    () => (targetCity ? formatTimeInTimezone(targetCity.timezone, ref) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetCity, referenceDate],
  );

  const day = useMemo(() => {
    if (!targetCity || !homeTimezone) return null;
    const targetDay = getDayInTimezone(targetCity.timezone, ref);
    const homeDay = getDayInTimezone(homeTimezone, ref);
    return targetDay !== homeDay ? targetDay : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCity, homeTimezone, referenceDate]);

  const utcOffset = useMemo(
    () => (targetCity ? getUTCOffset(targetCity.timezone, ref) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetCity, referenceDate],
  );

  const relOffset = useMemo(
    () => (targetCity && homeTimezone ? getRelativeOffset(homeTimezone, targetCity.timezone, ref) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetCity, homeTimezone, referenceDate],
  );

  if (!targetCity) {
    return <p className="results-empty">{t('forward.selectPrompt')}</p>;
  }

  return (
    <div className="forward-result">
      <div className="forward-result__time-row">
        <div className="forward-result__time">{time}</div>
        {canStar && tz && (
          <button
            type="button"
            className={`forward-result__star${starred ? ' forward-result__star--active' : ''}`}
            onClick={() => (starred ? removeFavorite(tz) : addFavorite(tz))}
            aria-label={t(starred ? 'favorites.remove' : 'favorites.add')}
          >
            <Star size={20} fill={starred ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        )}
      </div>
      {day && <div className="forward-result__day">{day}</div>}
      <div className="forward-result__meta">
        <span className="forward-result__offset">{utcOffset}</span>
        <span className="forward-result__rel-offset">
          {t('forward.relativeOffset', { offset: relOffset })}
        </span>
      </div>
    </div>
  );
}
