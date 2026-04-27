import { useMemo } from 'react';
import { formatTimeInTimezone, getDayInTimezone, getUTCOffset, getRelativeOffset } from '../../utils/timezone';
import { useT } from '../../contexts/LanguageContext';
import './ForwardResult.css';

export default function ForwardResult({ targetCity, homeTimezone, referenceDate }) {
  const t = useT();
  const ref = referenceDate ?? new Date();

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
      <div className="forward-result__time">{time}</div>
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
