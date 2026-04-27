import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReverseResults from './ReverseResults';
import { LanguageProvider } from '../../contexts/LanguageContext';

vi.mock('../../utils/timezone', () => ({
  findCitiesAtHour: vi.fn(),
  formatTimeInTimezone: vi.fn(() => '5:00 AM'),
  getDayInTimezone: vi.fn(() => 'Monday'),
  getUTCOffset: vi.fn(() => 'GMT+1'),
}));

vi.mock('../../data/cities', () => ({
  cities: [],
}));

import { findCitiesAtHour } from '../../utils/timezone';

function renderResults(props) {
  return render(<LanguageProvider><ReverseResults {...props} /></LanguageProvider>);
}

describe('ReverseResults', () => {
  it('shows prompt when targetHour is null', () => {
    renderResults({ targetHour: null, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText(/Select a target time/i)).toBeInTheDocument();
  });

  it('shows empty message when no cities match', () => {
    findCitiesAtHour.mockReturnValue([]);
    renderResults({ targetHour: 5, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText(/No major cities found/i)).toBeInTheDocument();
  });

  it('renders city results grouped by offset', () => {
    findCitiesAtHour.mockReturnValue([
      { timezone: 'Europe/London', label: 'London, United Kingdom' },
      { timezone: 'Europe/Lisbon', label: 'Lisbon, Portugal' },
    ]);
    renderResults({ targetHour: 5, homeTimezone: 'America/Edmonton' });
    expect(screen.getByText('London, United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Lisbon, Portugal')).toBeInTheDocument();
  });
});
