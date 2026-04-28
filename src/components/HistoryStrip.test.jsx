import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryStrip from './HistoryStrip';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/cities', () => ({
  findCityByTimezone: (tz) =>
    tz === 'Asia/Tokyo'
      ? { timezone: 'Asia/Tokyo', city: 'Tokyo', label: 'Tokyo, Japan' }
      : null,
}));

function renderStrip(props) {
  return render(
    <LanguageProvider>
      <HistoryStrip onSelect={() => {}} onClear={() => {}} {...props} />
    </LanguageProvider>,
  );
}

describe('HistoryStrip', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = renderStrip({ entries: [], type: 'forward' });
    expect(container.firstChild).toBeNull();
  });

  it('renders one chip per forward entry showing the city short name', () => {
    renderStrip({
      type: 'forward',
      entries: [{ type: 'forward', timezone: 'Asia/Tokyo', timestamp: 1 }],
    });
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('renders one chip per reverse entry showing the target hour', () => {
    renderStrip({
      type: 'reverse',
      entries: [{ type: 'reverse', timezone: 'America/Edmonton', targetHour: 14, timestamp: 1 }],
    });
    expect(screen.getByText(/14:00/)).toBeInTheDocument();
  });

  it('clicking a chip calls onSelect with the entry', async () => {
    const onSelect = vi.fn();
    const entry = { type: 'forward', timezone: 'Asia/Tokyo', timestamp: 1 };
    const user = userEvent.setup();
    renderStrip({ type: 'forward', entries: [entry], onSelect });
    await user.click(screen.getByText('Tokyo'));
    expect(onSelect).toHaveBeenCalledWith(entry);
  });

  it('clicking the clear button calls onClear', async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    renderStrip({
      type: 'forward',
      entries: [{ type: 'forward', timezone: 'Asia/Tokyo', timestamp: 1 }],
      onClear,
    });
    await user.click(screen.getByRole('button', { name: /clear history/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
