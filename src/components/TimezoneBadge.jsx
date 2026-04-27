import { useState } from 'react';
import CitySelect from './CitySelect';
import PolicyInfoIcon from './PolicyInfoIcon';
import { findCityByTimezone } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './TimezoneBadge.css';

export default function TimezoneBadge({ timezone, onTimezoneChange }) {
  const t = useT();
  const [picking, setPicking] = useState(false);
  const city = timezone ? findCityByTimezone(timezone) : null;
  const label = city ? city.label : (timezone ?? null);

  if (!timezone) {
    return (
      <span className="timezone-badge timezone-badge--unset">
        <CitySelect
          value={null}
          onChange={(c) => onTimezoneChange(c.timezone)}
          placeholder={t('nav.selectTimezone')}
        />
      </span>
    );
  }

  if (picking) {
    return (
      <span className="timezone-badge timezone-badge--picking">
        <CitySelect
          value={city}
          onChange={(c) => { onTimezoneChange(c.timezone); setPicking(false); }}
        />
      </span>
    );
  }

  return (
    <span className="timezone-badge timezone-badge--display-wrapper">
      <button
        type="button"
        className="timezone-badge timezone-badge--display"
        onClick={() => setPicking(true)}
        aria-label={t('nav.changeTimezone')}
      >
        {label} ↓
      </button>
      <PolicyInfoIcon timezone={timezone} />
    </span>
  );
}
