import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PolicyInfoIcon from './PolicyInfoIcon';
import ToastContainer from './ToastContainer';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';

beforeEach(() => {
  // Default fetch mock returns no dynamic rules; tests can override.
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
});

function renderIcon(timezone) {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <PolicyInfoIcon timezone={timezone} />
        <ToastContainer />
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('PolicyInfoIcon', () => {
  it('renders nothing for zones without recent changes', () => {
    const { container } = renderIcon('Europe/London');
    expect(container.firstChild).toBeNull();
  });

  it('renders the icon for affected zones', () => {
    renderIcon('America/Edmonton');
    expect(screen.getByRole('button', { name: /timezone rules/i })).toBeInTheDocument();
  });

  it('clicking shows the localised explanation in a toast', async () => {
    const user = userEvent.setup();
    renderIcon('America/Edmonton');
    await user.click(screen.getByRole('button', { name: /timezone rules/i }));
    expect(
      screen.getByText((text) => /Alberta|永久夏令时/.test(text)),
    ).toBeInTheDocument();
  });
});
