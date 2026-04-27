import { useMemo } from 'react';
import { formatTimeInTimezone, getDayInTimezone, getUTCOffset, getRelativeOffset } from '../../utils/timezone';
import { useT } from '../../contexts/LanguageContext';
import './ForwardResult.css';

export default function ForwardResult({ targetCity, homeTimezone }) {
  const t = useT();

  const time = useMemo(
    () => (targetCity ? formatTimeInTimezone(targetCity.timezone) : null),
    [targetCity],
  );

  const day = useMemo(() => {
    if (!targetCity || !homeTimezone) return null;
    const targetDay = getDayInTimezone(targetCity.timezone);
    const homeDay = getDayInTimezone(homeTimezone);
    return targetDay !== homeDay ? targetDay : null;
  }, [targetCity, homeTimezone]);

  const utcOffset = useMemo(
    () => (targetCity ? getUTCOffset(targetCity.timezone) : null),
    [targetCity],
  );

  const relOffset = useMemo(
    () => (targetCity && homeTimezone ? getRelativeOffset(homeTimezone, targetCity.timezone) : null),
    [targetCity, homeTimezone],
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
