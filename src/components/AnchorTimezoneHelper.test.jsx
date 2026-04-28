import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnchorTimezoneHelper from './AnchorTimezoneHelper';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/cities', () => ({
  cities: [],
  findCityByTimezone: (tz) =>
    tz === 'America/Edmonton'
      ? { timezone: 'America/Edmonton', city: 'Edmonton', country: 'Canada', label: 'Edmonton, Canada' }
      : null,
}));

vi.mock('../utils/sleepTimezone', () => ({
  findSleepTimezones: vi.fn(),
  formatOffsetLabel: (min) => (min === 0 ? 'UTC' : `UTC${min > 0 ? '+' : '−'}${Math.abs(min) / 60}`),
  formatDuration: (min) => `${Math.abs(min) / 60} h`,
}));

import { findSleepTimezones } from '../utils/sleepTimezone';

beforeEach(() => {
  localStorage.clear();
  findSleepTimezones.mockReset();
});

function renderHelper(props = {}) {
  return render(
    <LanguageProvider>
      <AnchorTimezoneHelper homeTimezone="America/Edmonton" {...props} />
    </LanguageProvider>,
  );
}

describe('AnchorTimezoneHelper', () => {
  it('shows the placeholder until both inputs are set', () => {
    findSleepTimezones.mockReturnValue(null);
    renderHelper();
    expect(screen.getByText(/Set both times/i)).toBeInTheDocument();
  });

  it('renders the candidate list when sleepTimezone returns matches', () => {
    findSleepTimezones.mockReturnValue({
      delta: -60,
      homeOffset: -420,
      targetOffset: -480,
      candidates: [
        { city: { timezone: 'America/Los_Angeles', city: 'Los Angeles', label: 'Los Angeles, United States' }, offset: -480 },
      ],
      visible: [
        { city: { timezone: 'America/Los_Angeles', city: 'Los Angeles', label: 'Los Angeles, United States' }, offset: -480 },
      ],
      overflow: 0,
      closest: null,
    });
    localStorage.setItem('kzone-anchor', JSON.stringify({ anchor: '05:00', actual: '06:00' }));
    renderHelper();
    expect(screen.getByText('Los Angeles, United States')).toBeInTheDocument();
    expect(screen.getByText(/behind home/i)).toBeInTheDocument();
  });

  it('falls back to closest candidate when no exact match', () => {
    findSleepTimezones.mockReturnValue({
      delta: 30,
      homeOffset: 0,
      targetOffset: 30,
      candidates: [],
      visible: [],
      overflow: 0,
      closest: {
        city: { timezone: 'Asia/Kathmandu', city: 'Kathmandu', label: 'Kathmandu, Nepal' },
        offset: 345,
      },
    });
    localStorage.setItem('kzone-anchor', JSON.stringify({ anchor: '05:30', actual: '05:00' }));
    renderHelper();
    expect(screen.getByText(/No exact match/i)).toBeInTheDocument();
    expect(screen.getByText('Kathmandu, Nepal')).toBeInTheDocument();
  });

  it('clear button removes both inputs and persists empty', async () => {
    localStorage.setItem('kzone-anchor', JSON.stringify({ anchor: '05:00', actual: '06:00' }));
    findSleepTimezones.mockReturnValue({
      delta: -60,
      homeOffset: -420,
      targetOffset: -480,
      candidates: [],
      visible: [],
      overflow: 0,
      closest: null,
    });
    const user = userEvent.setup();
    renderHelper();
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await user.click(clearBtn);
    expect(localStorage.getItem('kzone-anchor')).toBe('{}');
  });
});
