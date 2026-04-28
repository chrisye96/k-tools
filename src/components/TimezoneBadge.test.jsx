import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimezoneBadge from './TimezoneBadge';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/cities', () => ({
  cities: [
    { timezone: 'America/Edmonton', city: 'Calgary', country: 'Canada', label: 'Calgary, Canada', popular: true },
  ],
  findCityByTimezone: (tz) =>
    tz === 'America/Edmonton'
      ? { timezone: 'America/Edmonton', city: 'Calgary', country: 'Canada', label: 'Calgary, Canada', popular: true }
      : null,
}));

function renderBadge(props) {
  return render(<LanguageProvider><TimezoneBadge {...props} /></LanguageProvider>);
}

describe('TimezoneBadge', () => {
  it('displays the city label as the input value when timezone is known', () => {
    renderBadge({ timezone: 'America/Edmonton', onTimezoneChange: () => {} });
    expect(screen.getByDisplayValue('Calgary, Canada')).toBeInTheDocument();
  });

  it('shows "select your timezone" placeholder when timezone is null', () => {
    renderBadge({ timezone: null, onTimezoneChange: () => {} });
    expect(screen.getByPlaceholderText(/Select your timezone/i)).toBeInTheDocument();
  });

  it('opens the listbox on a single click in the input', async () => {
    const user = userEvent.setup();
    renderBadge({ timezone: 'America/Edmonton', onTimezoneChange: () => {} });
    const input = screen.getByRole('combobox').querySelector('input');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders the policy icon for affected zones alongside the input', () => {
    renderBadge({ timezone: 'America/Edmonton', onTimezoneChange: () => {} });
    expect(screen.getByRole('button', { name: /timezone rules/i })).toBeInTheDocument();
  });
});
