import { useEffect, useRef, useState } from 'react';
import TimePicker from 'react-time-picker';
import { useT } from '../contexts/LanguageContext';
import './TimePickerWithDropdown.css';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseHM(value) {
  if (!value) return { h: null, m: null };
  const [h, m] = value.split(':').map((s) => parseInt(s, 10));
  return {
    h: Number.isFinite(h) ? h : null,
    m: Number.isFinite(m) ? m : null,
  };
}

function format(h, m) {
  return `${pad(h ?? 0)}:${pad(m ?? 0)}`;
}

export default function TimePickerWithDropdown({
  value,
  onChange,
  className = '',
  pickerClassName = '',
  id,
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const { h: currentH, m: currentM } = parseHM(value);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Centre the current value on open so the user does not have to scroll
  useEffect(() => {
    if (!open) return;
    const scrollSelected = (listEl) => {
      if (!listEl) return;
      const selected = listEl.querySelector('[aria-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    };
    scrollSelected(hourListRef.current);
    scrollSelected(minuteListRef.current);
  }, [open]);

  function handleHour(h) {
    onChange(format(h, currentM));
    // Hour does not close: user is likely choosing the minute next.
  }

  function handleMinute(m) {
    onChange(format(currentH, m));
    setOpen(false);
  }

  // Closest matching option for the selected highlight (round minutes to the
  // nearest 5 so an arbitrarily-typed value still has a visible anchor).
  const highlightedMinute = currentM == null ? null : Math.round(currentM / 5) * 5 % 60;

  return (
    <div ref={wrapperRef} className={`time-picker-dropdown ${className}`}>
      <TimePicker
        id={id}
        className={pickerClassName}
        format="HH:mm"
        disableClock
        clockIcon={null}
        clearIcon={null}
        hourAriaLabel={t('time.hour')}
        minuteAriaLabel={t('time.minute')}
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="time-picker-dropdown__panel">
          <ul
            ref={hourListRef}
            role="listbox"
            aria-label={t('time.hour')}
            className="time-picker-dropdown__col"
          >
            {HOURS.map((h) => {
              const selected = h === currentH;
              return (
                <li
                  key={h}
                  role="option"
                  aria-selected={selected}
                  className={`time-picker-dropdown__cell${selected ? ' is-selected' : ''}`}
                  onClick={() => handleHour(h)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHour(h); }}
                  tabIndex={-1}
                >
                  {pad(h)}
                </li>
              );
            })}
          </ul>
          <ul
            ref={minuteListRef}
            role="listbox"
            aria-label={t('time.minute')}
            className="time-picker-dropdown__col"
          >
            {MINUTES.map((m) => {
              const selected = m === highlightedMinute;
              return (
                <li
                  key={m}
                  role="option"
                  aria-selected={selected}
                  className={`time-picker-dropdown__cell${selected ? ' is-selected' : ''}`}
                  onClick={() => handleMinute(m)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMinute(m); }}
                  tabIndex={-1}
                >
                  {pad(m)}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
