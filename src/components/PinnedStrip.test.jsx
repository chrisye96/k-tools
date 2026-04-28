import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinnedStrip from './PinnedStrip';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/cities', () => ({
  findCityByTimezone: (tz) =>
    tz === 'Asia/Tokyo'
      ? { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', label: 'Tokyo, Japan' }
      : tz === 'Europe/London'
        ? { timezone: 'Europe/London', city: 'London', country: 'United Kingdom', label: 'London, United Kingdom' }
        : null,
}));

vi.mock('../utils/timezone', () => ({
  formatTimeInTimezone: vi.fn(() => '9:00 PM'),
}));

function renderStrip(props) {
  return render(
    <LanguageProvider>
      <PinnedStrip onUnpin={() => {}} {...props} />
    </LanguageProvider>
  );
}

describe('PinnedStrip', () => {
  it('renders nothing when pinned is empty', () => {
    const { container } = renderStrip({ pinned: [] });
    expect(container.firstChild).toBeNull();
  });

  it('renders one chip per pinned timezone with the city short name', () => {
    renderStrip({ pinned: ['Asia/Tokyo', 'Europe/London'] });
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders the live time alongside each pinned chip', () => {
    renderStrip({ pinned: ['Asia/Tokyo'] });
    expect(screen.getByText('9:00 PM')).toBeInTheDocument();
  });

  it('clicking the unpin button calls onUnpin with the timezone', async () => {
    const onUnpin = vi.fn();
    const user = userEvent.setup();
    renderStrip({ pinned: ['Asia/Tokyo'], onUnpin });
    await user.click(screen.getByRole('button', { name: /unpin/i }));
    expect(onUnpin).toHaveBeenCalledWith('Asia/Tokyo');
  });
});
