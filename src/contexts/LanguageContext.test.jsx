import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useT, useLanguage } from './LanguageContext';

function Probe() {
  const t = useT();
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="title">{t('section.searchByTime')}</span>
      <span data-testid="interp">{t('timeTravel.active', { date: 'Dec 25' })}</span>
      <button onClick={() => setLanguage('zh')}>zh</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to en when no localStorage and navigator is en', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('title').textContent).toBe('Search by Time');
  });

  it('reads language from localStorage on mount', () => {
    localStorage.setItem('kzone-language', 'zh');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('zh');
    expect(screen.getByTestId('title').textContent).toBe('按时间查找');
  });

  it('interpolates {placeholder} tokens', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('interp').textContent).toBe('Showing results for: Dec 25');
  });

  it('persists setLanguage to localStorage', async () => {
    const user = userEvent.setup();
    render(<LanguageProvider><Probe /></LanguageProvider>);
    await user.click(screen.getByText('zh'));
    expect(localStorage.getItem('kzone-language')).toBe('zh');
    expect(screen.getByTestId('title').textContent).toBe('按时间查找');
  });

  it('falls back to the key string when missing', () => {
    function Missing() {
      const t = useT();
      return <span data-testid="missing">{t('does.not.exist')}</span>;
    }
    render(<LanguageProvider><Missing /></LanguageProvider>);
    expect(screen.getByTestId('missing').textContent).toBe('does.not.exist');
  });
});
