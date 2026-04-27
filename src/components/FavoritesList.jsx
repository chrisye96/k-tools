import { findCityByTimezone } from '../data/cities';
import { formatTimeInTimezone } from '../utils/timezone';
import { useT } from '../contexts/LanguageContext';
import './FavoritesList.css';

export default function FavoritesList({ favorites, onSelect, referenceDate }) {
  const t = useT();
  if (favorites.length === 0) return null;
  const ref = referenceDate ?? new Date();

  return (
    <div className="favorites-list">
      <span className="favorites-list__label">{t('favorites.title')}</span>
      <div className="favorites-list__chips">
        {favorites.map((tz) => {
          const city = findCityByTimezone(tz);
          if (!city) return null;
          return (
            <button
              key={tz}
              type="button"
              className="favorites-chip"
              onClick={() => onSelect(tz)}
            >
              <span className="favorites-chip__city">{city.label}</span>
              <span className="favorites-chip__time">{formatTimeInTimezone(tz, ref)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
