import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustFooter from './TrustFooter';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../data/tzdbVersion', () => ({ TZDB_VERSION: '2026a' }));

describe('TrustFooter', () => {
  it('renders the version string interpolated into the footer copy', () => {
    render(<LanguageProvider><TrustFooter /></LanguageProvider>);
    expect(screen.getByText(/2026a/)).toBeInTheDocument();
  });

  it('uses contentinfo landmark for accessibility', () => {
    render(<LanguageProvider><TrustFooter /></LanguageProvider>);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
