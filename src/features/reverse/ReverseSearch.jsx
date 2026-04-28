import { useState } from 'react';
import TimePickerWithDropdown from '../../components/TimePickerWithDropdown';
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
        <TimePickerWithDropdown
          id="target-time"
          value={time}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}
