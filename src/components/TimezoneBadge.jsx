import { useEffect, useRef, useState } from 'react';
import CitySelect from './CitySelect';
import PolicyInfoIcon from './PolicyInfoIcon';
import { findCityByTimezone } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './TimezoneBadge.css';

export default function TimezoneBadge({ timezone, onTimezoneChange }) {
  const t = useT();
  const [picking, setPicking] = useState(false);
  const wrapperRef = useRef(null);
  const city = timezone ? findCityByTimezone(timezone) : null;
  const label = city ? city.label : (timezone ?? null);

  // Click outside or Escape closes the popover. Mounted only while picking.
  useEffect(() => {
    if (!picking) return;
    const onMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setPicking(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setPicking(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [picking]);

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

  return (
    <span
      ref={wrapperRef}
      className="timezone-badge timezone-badge--display-wrapper"
    >
      <button
        type="button"
        className="timezone-badge timezone-badge--display"
        onClick={() => setPicking((p) => !p)}
        aria-label={t('nav.changeTimezone')}
        aria-expanded={picking}
        aria-haspopup="listbox"
      >
        <span className="timezone-badge__label">{label}</span>
        <span className="timezone-badge__chevron" aria-hidden="true">▾</span>
      </button>
      <PolicyInfoIcon timezone={timezone} />
      {picking && (
        <div className="timezone-badge__popover">
          <CitySelect
            value={city}
            onChange={(c) => {
              onTimezoneChange(c.timezone);
              setPicking(false);
            }}
          />
        </div>
      )}
    </span>
  );
}
