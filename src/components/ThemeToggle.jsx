import { useTheme } from '../contexts/ThemeContext';
import { useT } from '../contexts/LanguageContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const labelKey = theme === 'light' ? 'nav.themeToggle.toDark' : 'nav.themeToggle.toLight';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={t(labelKey)}
      onClick={toggleTheme}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
