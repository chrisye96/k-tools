import { findCityByTimezone } from '../data/cities';
import { formatTimeInTimezone } from '../utils/timezone';
import { useT } from '../contexts/LanguageContext';
import useNow from '../utils/useNow';
import './FavoritesList.css';

export default function FavoritesList({
  favorites,
  onSelect,
  referenceDate,
  isPinned,
  pin,
  unpin,
}) {
  const t = useT();
  const liveNow = useNow();
  if (favorites.length === 0) return null;
  const ref = referenceDate ?? liveNow;

  const canPin = typeof isPinned === 'function' && typeof pin === 'function' && typeof unpin === 'function';

  return (
    <div className="favorites-list">
      <span className="favorites-list__label">{t('favorites.title')}</span>
      <div className="favorites-list__chips">
        {favorites.map((tz) => {
          const city = findCityByTimezone(tz);
          if (!city) return null;
          const pinned = canPin ? isPinned(tz) : false;
          return (
            <span key={tz} className="favorites-chip-wrap">
              <button
                type="button"
                className="favorites-chip"
                onClick={() => onSelect(tz)}
              >
                <span className="favorites-chip__city">{city.label}</span>
                <span className="favorites-chip__time">{formatTimeInTimezone(tz, ref)}</span>
              </button>
              {canPin && (
                <button
                  type="button"
                  className={`favorites-chip__pin${pinned ? ' favorites-chip__pin--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    pinned ? unpin(tz) : pin(tz);
                  }}
                  aria-label={t(pinned ? 'pinned.remove' : 'pinned.add')}
                  title={t(pinned ? 'pinned.remove' : 'pinned.add')}
                >
                  📌
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
