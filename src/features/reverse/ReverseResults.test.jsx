import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReverseResults from './ReverseResults';

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

describe('ReverseResults', () => {
  it('shows prompt when targetHour is null', () => {
    render(<ReverseResults targetHour={null} homeTimezone="America/Edmonton" />);
    expect(screen.getByText(/Select a target time/i)).toBeInTheDocument();
  });

  it('shows empty message when no cities match', () => {
    findCitiesAtHour.mockReturnValue([]);
    render(<ReverseResults targetHour={5} homeTimezone="America/Edmonton" />);
    expect(screen.getByText(/No major cities found/i)).toBeInTheDocument();
  });

  it('renders city results grouped by offset', () => {
    findCitiesAtHour.mockReturnValue([
      { timezone: 'Europe/London', label: 'London, United Kingdom' },
      { timezone: 'Europe/Lisbon', label: 'Lisbon, Portugal' },
    ]);
    render(<ReverseResults targetHour={5} homeTimezone="America/Edmonton" />);
    expect(screen.getByText('London, United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Lisbon, Portugal')).toBeInTheDocument();
  });
});
