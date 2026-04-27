import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateTimePicker from './DateTimePicker';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderPicker(props = {}) {
  const onChange = vi.fn();
  const onClose = vi.fn();
  render(
    <LanguageProvider>
      <DateTimePicker
        open
        value={new Date('2026-04-15T10:00:00Z')}
        timezone="UTC"
        onChange={onChange}
        onClose={onClose}
        {...props}
      />
    </LanguageProvider>
  );
  return { onChange, onClose };
}

describe('DateTimePicker', () => {
  it('renders nothing when open is false', () => {
    render(
      <LanguageProvider>
        <DateTimePicker open={false} value={null} timezone="UTC" onChange={() => {}} onClose={() => {}} />
      </LanguageProvider>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('exposes calendar grid and time grid when open', () => {
    renderPicker();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minute/i)).toBeInTheDocument();
  });

  it('selecting a different day fires onChange with a Date', async () => {
    const { onChange } = renderPicker();
    const user = userEvent.setup();
    const cell = screen.getByRole('gridcell', { name: /20/ });
    const target = cell.querySelector('button') ?? cell;
    await user.click(target);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall[0]).toBeInstanceOf(Date);
  });

  it('clicking close fires onClose', async () => {
    const { onClose } = renderPicker();
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
