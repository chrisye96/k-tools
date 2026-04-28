import { findCityByTimezone } from '../data/cities';
import { formatTimeInTimezone } from '../utils/timezone';
import { useT } from '../contexts/LanguageContext';
import useNow from '../utils/useNow';
import './PinnedStrip.css';

export default function PinnedStrip({ pinned, referenceDate, onUnpin }) {
  const t = useT();
  const liveNow = useNow();
  if (!pinned || pinned.length === 0) return null;
  const ref = referenceDate ?? liveNow;

  return (
    <div className="pinned-strip" role="list" aria-label={t('pinned.title')}>
      {pinned.map((tz) => {
        const city = findCityByTimezone(tz);
        if (!city) return null;
        return (
          <span key={tz} className="pinned-chip" role="listitem">
            <span className="pinned-chip__city">{city.city}</span>
            <span className="pinned-chip__time">{formatTimeInTimezone(tz, ref)}</span>
            <button
              type="button"
              className="pinned-chip__unpin"
              onClick={() => onUnpin(tz)}
              aria-label={t('pinned.remove')}
              title={t('pinned.remove')}
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
}
