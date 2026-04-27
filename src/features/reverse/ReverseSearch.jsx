import TimezoneBadge from '../../components/TimezoneBadge';
import { useT } from '../../contexts/LanguageContext';
import './ReverseSearch.css';

export default function ReverseSearch({ homeTimezone, onTimezoneChange, onTargetHourChange }) {
  const t = useT();

  function handleTimeChange(e) {
    if (!e.target.value) {
      onTargetHourChange(null);
      return;
    }
    const [h] = e.target.value.split(':');
    onTargetHourChange(parseInt(h, 10));
  }

  return (
    <div className="reverse-search">
      <h2 className="reverse-search__title">{t('reverse.title')}</h2>
      <div className="reverse-search__row">
        <span className="reverse-search__label">{t('reverse.youAreIn')}</span>
        <TimezoneBadge timezone={homeTimezone} onTimezoneChange={onTimezoneChange} />
      </div>
      <div className="reverse-search__row">
        <label className="reverse-search__label" htmlFor="target-time">
          {t('reverse.showCitiesAt')}:
        </label>
        <input
          id="target-time"
          type="time"
          className="reverse-search__time-input"
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}
