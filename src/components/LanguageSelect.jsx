import { useLanguage, useT } from '../contexts/LanguageContext';
import './LanguageSelect.css';

const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
];

export default function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <select
      className="language-select"
      aria-label={t('nav.languageSelect.label')}
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
