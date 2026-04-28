import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useT } from '../contexts/LanguageContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const labelKey = theme === 'light' ? 'nav.themeToggle.toDark' : 'nav.themeToggle.toLight';
  const Icon = theme === 'light' ? Moon : Sun;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={t(labelKey)}
      onClick={toggleTheme}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
