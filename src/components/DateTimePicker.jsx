import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useT } from '../contexts/LanguageContext';
import './DateTimePicker.css';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function DateTimePicker({ open, value, onChange, onClose }) {
  const t = useT();
  const [draft, setDraft] = useState(() => value ?? new Date());

  useEffect(() => {
    if (open) setDraft(value ?? new Date());
  }, [open, value]);

  if (!open) return null;

  function setDay(day) {
    if (!day) return;
    const next = new Date(draft);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setDraft(next);
    onChange(next);
  }

  function setHour(h) {
    const next = new Date(draft);
    next.setHours(h);
    setDraft(next);
    onChange(next);
  }

  function setMinute(m) {
    const next = new Date(draft);
    next.setMinutes(m);
    setDraft(next);
    onChange(next);
  }

  return (
    <div className="datetime-picker__backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('datetime.dialog.label')}
        className="datetime-picker"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="datetime-picker__close">
          <button type="button" aria-label={t('common.close')} onClick={onClose}>×</button>
        </div>
        <div className="datetime-picker__cols">
          <DayPicker
            mode="single"
            selected={draft}
            onSelect={setDay}
            showOutsideDays
          />
          <div className="datetime-picker__time">
            <ul aria-label={t('time.hour')} className="datetime-picker__list">
              {HOURS.map((h) => (
                <li key={h}>
                  <button
                    type="button"
                    className={h === draft.getHours() ? 'is-selected' : ''}
                    onClick={() => setHour(h)}
                  >
                    {pad(h)}
                  </button>
                </li>
              ))}
            </ul>
            <ul aria-label={t('time.minute')} className="datetime-picker__list">
              {MINUTES.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    className={m === Math.floor(draft.getMinutes() / 5) * 5 ? 'is-selected' : ''}
                    onClick={() => setMinute(m)}
                  >
                    {pad(m)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
