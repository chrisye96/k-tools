import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesList from './FavoritesList';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/cities', () => ({
  findCityByTimezone: (tz) =>
    tz === 'Asia/Tokyo'
      ? { timezone: 'Asia/Tokyo', label: 'Tokyo, Japan' }
      : null,
}));

vi.mock('../utils/timezone', () => ({
  formatTimeInTimezone: vi.fn(() => '9:00 PM'),
}));

function renderWithProviders(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('FavoritesList', () => {
  beforeEach(() => localStorage.clear());

  it('renders nothing when favorites is empty', () => {
    const { container } = renderWithProviders(
      <FavoritesList favorites={[]} onSelect={() => {}} referenceDate={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a card for each favorite', () => {
    renderWithProviders(
      <FavoritesList favorites={['Asia/Tokyo']} onSelect={() => {}} referenceDate={null} />
    );
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument();
    expect(screen.getByText('9:00 PM')).toBeInTheDocument();
  });

  it('renders the localised "Favorites" label (EN by default)', () => {
    renderWithProviders(
      <FavoritesList favorites={['Asia/Tokyo']} onSelect={() => {}} referenceDate={null} />
    );
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('renders the ZH label when language is zh', () => {
    localStorage.setItem('kzone-language', 'zh');
    renderWithProviders(
      <FavoritesList favorites={['Asia/Tokyo']} onSelect={() => {}} referenceDate={null} />
    );
    expect(screen.getByText('收藏')).toBeInTheDocument();
  });

  it('calls onSelect with timezone when card is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderWithProviders(
      <FavoritesList favorites={['Asia/Tokyo']} onSelect={handleSelect} referenceDate={null} />
    );
    await user.click(screen.getByText('Tokyo, Japan'));
    expect(handleSelect).toHaveBeenCalledWith('Asia/Tokyo');
  });
});
