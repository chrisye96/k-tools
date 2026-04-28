import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import TimePickerWithDropdown from './TimePickerWithDropdown';
import { useT } from '../contexts/LanguageContext';
import './DateTimePicker.css';

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateToTimeString(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

  function setTime(time) {
    if (!time) return;
    const [h, m] = time.split(':').map((s) => parseInt(s, 10));
    const next = new Date(draft);
    next.setHours(h);
    next.setMinutes(Number.isNaN(m) ? 0 : m);
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
          <button type="button" aria-label={t('common.close')} onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="datetime-picker__cols">
          <DayPicker
            mode="single"
            selected={draft}
            onSelect={setDay}
            showOutsideDays
          />
          <div className="datetime-picker__time">
            <span className="datetime-picker__time-label">{t('time.hour')} : {t('time.minute')}</span>
            <TimePickerWithDropdown
              pickerClassName="react-time-picker--lg"
              value={dateToTimeString(draft)}
              onChange={setTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
