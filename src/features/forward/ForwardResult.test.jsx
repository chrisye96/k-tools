import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForwardResult from './ForwardResult';
import { LanguageProvider } from '../../contexts/LanguageContext';

vi.mock('../../utils/timezone', () => ({
  formatTimeInTimezone: vi.fn(() => '9:00 PM'),
  getDayInTimezone: vi.fn((tz) => (tz === 'Asia/Tokyo' ? 'Tuesday' : 'Monday')),
  getUTCOffset: vi.fn(() => 'GMT+9'),
  getRelativeOffset: vi.fn(() => '+15h'),
}));

const tokyoCity = {
  timezone: 'Asia/Tokyo',
  city: 'Tokyo',
  country: 'Japan',
  label: 'Tokyo, Japan',
  popular: true,
};

function renderResult(props) {
  return render(<LanguageProvider><ForwardResult {...props} /></LanguageProvider>);
}

describe('ForwardResult', () => {
  it('shows prompt when no city selected', () => {
    renderResult({ targetCity: null, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText(/Select a city/i)).toBeInTheDocument();
  });

  it('shows time when city is selected', () => {
    renderResult({ targetCity: tokyoCity, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText('9:00 PM')).toBeInTheDocument();
  });

  it('shows day when target day differs from home day', () => {
    renderResult({ targetCity: tokyoCity, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  it('shows UTC offset and relative offset', () => {
    renderResult({ targetCity: tokyoCity, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText('GMT+9')).toBeInTheDocument();
    expect(screen.getByText(/\+15h/)).toBeInTheDocument();
  });
});
