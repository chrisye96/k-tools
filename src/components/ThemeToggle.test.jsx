import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderToggle() {
  return render(
    <LanguageProvider>
      <ThemeProvider><ThemeToggle /></ThemeProvider>
    </LanguageProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders an accessible button', () => {
    renderToggle();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('shows moon glyph in light mode and sun in dark mode', async () => {
    renderToggle();
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('🌙');
    await userEvent.click(btn);
    expect(btn).toHaveTextContent('☀️');
  });

  it('flips data-theme on the html element on click', async () => {
    renderToggle();
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates aria-label as theme changes', async () => {
    renderToggle();
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toMatch(/dark/i);
    await userEvent.click(btn);
    expect(btn.getAttribute('aria-label')).toMatch(/light/i);
  });
});
