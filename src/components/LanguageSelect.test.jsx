import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSelect from './LanguageSelect';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderSelect() {
  return render(
    <LanguageProvider><LanguageSelect /></LanguageProvider>
  );
}

describe('LanguageSelect', () => {
  beforeEach(() => localStorage.clear());

  it('renders a labelled native select with EN and ZH options', () => {
    renderSelect();
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label');
    expect(within(select).getByRole('option', { name: /english|en/i })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: /中文|zh/i })).toBeInTheDocument();
  });

  it('reflects current language', () => {
    localStorage.setItem('kzone-language', 'zh');
    renderSelect();
    expect(screen.getByRole('combobox').value).toBe('zh');
  });

  it('changing the select updates the language and persists', async () => {
    renderSelect();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'zh');
    expect(localStorage.getItem('kzone-language')).toBe('zh');
  });
});
