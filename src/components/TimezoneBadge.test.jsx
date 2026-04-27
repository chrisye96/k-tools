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
  it('displays city label when timezone is known', () => {
    renderBadge({ timezone: 'America/Edmonton', onTimezoneChange: () => {} });
    expect(screen.getByText(/Calgary, Canada/)).toBeInTheDocument();
  });

  it('shows picker when timezone is null', () => {
    renderBadge({ timezone: null, onTimezoneChange: () => {} });
    expect(screen.getByPlaceholderText(/Select your timezone/i)).toBeInTheDocument();
  });

  it('opens picker when badge is clicked', async () => {
    const user = userEvent.setup();
    renderBadge({ timezone: 'America/Edmonton', onTimezoneChange: () => {} });
    const badge = screen.getByRole('button', { name: /change timezone/i });
    await user.click(badge);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
