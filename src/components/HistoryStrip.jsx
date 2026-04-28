import { findCityByTimezone } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './HistoryStrip.css';

function pad(n) {
  return String(n).padStart(2, '0');
}

function chipLabel(entry) {
  if (entry.type === 'forward') {
    const city = findCityByTimezone(entry.timezone);
    return city ? city.city : entry.timezone;
  }
  if (entry.type === 'reverse') {
    return `${pad(entry.targetHour ?? 0)}:00`;
  }
  return entry.timezone;
}

export default function HistoryStrip({ entries, type, onSelect, onClear }) {
  const t = useT();
  const filtered = (entries ?? []).filter((e) => e.type === type);
  if (filtered.length === 0) return null;

  return (
    <div className="history-strip" aria-label={t('history.title')}>
      <span className="history-strip__label">{t('history.title')}</span>
      <div className="history-strip__chips">
        {filtered.map((entry) => (
          <button
            key={`${entry.type}-${entry.timezone}-${entry.targetHour ?? ''}-${entry.timestamp}`}
            type="button"
            className="history-strip__chip"
            onClick={() => onSelect(entry)}
          >
            {chipLabel(entry)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="history-strip__clear"
        onClick={onClear}
        aria-label={t('history.clear')}
        title={t('history.clear')}
      >
        ×
      </button>
    </div>
  );
}
