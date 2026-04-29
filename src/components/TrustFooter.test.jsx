import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustFooter from './TrustFooter';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/tzdbVersion', () => ({ TZDB_VERSION: '2026a' }));
vi.mock('../data/appVersion', () => ({ APP_VERSION: '0.1.0' }));

function renderFooter() {
  return render(<LanguageProvider><TrustFooter /></LanguageProvider>);
}

describe('TrustFooter', () => {
  it('renders the IANA version interpolated into the footer copy', () => {
    renderFooter();
    expect(screen.getByText(/2026a/)).toBeInTheDocument();
  });

  it('uses contentinfo landmark for accessibility', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders a GitHub link to the repo', () => {
    renderFooter();
    const link = screen.getByRole('link', { name: /open source/i });
    expect(link).toHaveAttribute('href', 'https://github.com/chrisye96/k-tools');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders the app version next to the GitHub link', () => {
    renderFooter();
    expect(screen.getByText(/v0\.1\.0/)).toBeInTheDocument();
  });
});
