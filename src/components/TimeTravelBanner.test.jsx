import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeTravelBanner from './TimeTravelBanner';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderBanner(props) {
  return render(
    <LanguageProvider>
      <TimeTravelBanner onOpen={() => {}} onReset={() => {}} {...props} />
    </LanguageProvider>
  );
}

describe('TimeTravelBanner', () => {
  it('renders the inactive prompt when referenceDate is null', () => {
    renderBanner({ referenceDate: null });
    expect(screen.getByRole('button', { name: /set date\/time/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reset/i })).toBeNull();
  });

  it('renders active warning + reset when referenceDate is set', () => {
    renderBanner({ referenceDate: new Date('2026-12-25T10:00:00Z') });
    expect(screen.getByText(/showing results/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('clicking the inactive prompt calls onOpen', async () => {
    const onOpen = vi.fn();
    renderBanner({ referenceDate: null, onOpen });
    await userEvent.click(screen.getByRole('button', { name: /set date\/time/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('clicking active body calls onOpen, clicking Reset calls onReset only', async () => {
    const onOpen = vi.fn();
    const onReset = vi.fn();
    renderBanner({ referenceDate: new Date(), onOpen, onReset });
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
