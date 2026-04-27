import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import en from '../locales/en';
import zh from '../locales/zh';

const dictionaries = { en, zh };
const STORAGE_KEY = 'kzone-language';

const LanguageContext = createContext(null);

function detectInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && dictionaries[stored]) return stored;
  } catch {
    // localStorage may be unavailable (private mode, SSR, etc.)
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  const setLanguage = useCallback((next) => {
    if (!dictionaries[next]) return;
    setLanguageState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key, vars) => {
    const dict = dictionaries[language] ?? dictionaries.en;
    const template = dict[key];
    if (template == null) return key;
    return interpolate(template, vars);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
