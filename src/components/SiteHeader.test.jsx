import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteHeader from './SiteHeader';
import { LanguageProvider } from '../contexts/LanguageContext';

beforeEach(() => {
  window.scrollTo = vi.fn();
});

function renderHeader() {
  return render(<LanguageProvider><SiteHeader /></LanguageProvider>);
}

describe('SiteHeader', () => {
  it('renders the K-Zone wordmark', () => {
    renderHeader();
    expect(screen.getByText('K-Zone')).toBeInTheDocument();
  });

  it('renders the localised tagline (EN by default)', () => {
    renderHeader();
    expect(screen.getByText(/find any timezone/i)).toBeInTheDocument();
  });

  it('renders the ZH tagline when language is zh', () => {
    localStorage.setItem('kzone-language', 'zh');
    renderHeader();
    expect(screen.getByText(/查找任何城市的任何时区/)).toBeInTheDocument();
    localStorage.clear();
  });

  it('clicking the brand smooth-scrolls to top', async () => {
    const user = userEvent.setup();
    renderHeader();
    const brand = screen.getByRole('button');
    await user.click(brand);
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, behavior: 'smooth' }),
    );
  });
});
