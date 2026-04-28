import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders a labelled trigger that displays the current language', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-label');
    expect(trigger).toHaveTextContent('EN');
  });

  it('reflects the active language from localStorage on mount', () => {
    localStorage.setItem('kzone-language', 'zh');
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveTextContent('中文');
  });

  it('opens the listbox on click and lists EN + 中文', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '中文' })).toBeInTheDocument();
  });

  it('selecting an option updates language + persists', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '中文' }));
    expect(localStorage.getItem('kzone-language')).toBe('zh');
    expect(screen.getByRole('combobox')).toHaveTextContent('中文');
  });
});
