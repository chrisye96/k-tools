import { useState } from 'react';
import TimePicker from 'react-time-picker';
import TimezoneBadge from '../../components/TimezoneBadge';
import { useT } from '../../contexts/LanguageContext';
import './ReverseSearch.css';

export default function ReverseSearch({ homeTimezone, onTimezoneChange, onTargetHourChange }) {
  const t = useT();
  const [time, setTime] = useState(null);

  function handleTimeChange(value) {
    setTime(value);
    if (!value) {
      onTargetHourChange(null);
      return;
    }
    const [h] = value.split(':');
    onTargetHourChange(parseInt(h, 10));
  }

  return (
    <div className="reverse-search">
      <div className="reverse-search__row">
        <span className="reverse-search__label">{t('reverse.youAreIn')}</span>
        <TimezoneBadge timezone={homeTimezone} onTimezoneChange={onTimezoneChange} />
      </div>
      <div className="reverse-search__row">
        <label className="reverse-search__label" htmlFor="target-time">
          {t('reverse.showCitiesAt')}:
        </label>
        <TimePicker
          id="target-time"
          format="HH:mm"
          disableClock
          clockIcon={null}
          clearIcon={null}
          hourAriaLabel={t('time.hour')}
          minuteAriaLabel={t('time.minute')}
          value={time}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}
