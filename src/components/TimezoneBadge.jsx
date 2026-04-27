import { useState } from 'react';
import CitySelect from './CitySelect';
import { findCityByTimezone } from '../data/cities';
import './TimezoneBadge.css';

export default function TimezoneBadge({ timezone, onTimezoneChange }) {
  const [picking, setPicking] = useState(false);
  const city = timezone ? findCityByTimezone(timezone) : null;
  const label = city ? city.label : (timezone ?? null);

  if (!timezone) {
    return (
      <span className="timezone-badge timezone-badge--unset">
        <CitySelect
          value={null}
          onChange={(c) => onTimezoneChange(c.timezone)}
          placeholder="Select your timezone..."
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
          placeholder="Search city..."
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="timezone-badge timezone-badge--display"
      onClick={() => setPicking(true)}
      aria-label={`Your timezone: ${label}. Click to change.`}
    >
      {label} ↓
    </button>
  );
}
