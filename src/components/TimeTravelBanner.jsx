import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useT, useLanguage } from '../contexts/LanguageContext';
import './TimeTravelBanner.css';

function formatBannerDate(date, language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export default function TimeTravelBanner({ referenceDate, onOpen, onReset }) {
  const t = useT();
  const { language } = useLanguage();

  if (!referenceDate) {
    return (
      <button type="button" className="time-travel time-travel--inactive" onClick={onOpen}>
        {t('timeTravel.open')}
      </button>
    );
  }

  return (
    <div className="time-travel time-travel--active">
      <button type="button" className="time-travel__body" onClick={onOpen}>
        <AlertTriangle size={16} className="time-travel__warning" aria-hidden="true" />
        <span>{t('timeTravel.active', { date: formatBannerDate(referenceDate, language) })}</span>
      </button>
      <button
        type="button"
        className="time-travel__reset"
        aria-label={t('timeTravel.reset')}
        onClick={(e) => { e.stopPropagation(); onReset(); }}
      >
        <RotateCcw size={14} aria-hidden="true" />
        <span>{t('timeTravel.reset')}</span>
      </button>
    </div>
  );
}
