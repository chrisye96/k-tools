import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PolicyInfoIcon from './PolicyInfoIcon';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderIcon(timezone) {
  return render(
    <LanguageProvider><PolicyInfoIcon timezone={timezone} /></LanguageProvider>
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

  it('clicking shows the localised explanation', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderIcon('America/Edmonton');
    await userEvent.click(screen.getByRole('button', { name: /timezone rules/i }));
    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/Alberta|永久夏令时/));
    alertSpy.mockRestore();
  });
});
