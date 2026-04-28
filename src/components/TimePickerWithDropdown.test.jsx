import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimePickerWithDropdown from './TimePickerWithDropdown';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderPicker(props = {}) {
  const onChange = vi.fn();
  render(
    <LanguageProvider>
      <TimePickerWithDropdown value={null} onChange={onChange} {...props} />
    </LanguageProvider>,
  );
  return { onChange };
}

describe('TimePickerWithDropdown', () => {
  it('renders the time input with hour + minute aria labels', () => {
    renderPicker();
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minute/i)).toBeInTheDocument();
  });

  it('does not show the scroll panel before focus', () => {
    renderPicker();
    expect(screen.queryByRole('listbox', { name: /hour/i })).toBeNull();
  });

  it('shows hour + minute scroll lists when input gains focus', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByLabelText(/hour/i));
    expect(screen.getByRole('listbox', { name: /hour/i })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /minute/i })).toBeInTheDocument();
  });

  it('selecting an hour does not close the panel', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({ value: '10:00' });
    await user.click(screen.getByLabelText(/hour/i));
    const hourList = screen.getByRole('listbox', { name: /hour/i });
    await user.click(within(hourList).getByRole('option', { name: '14' }));
    expect(onChange).toHaveBeenCalledWith('14:00');
    expect(screen.queryByRole('listbox', { name: /hour/i })).toBeInTheDocument();
  });

  it('selecting a minute closes the panel', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPicker({ value: '10:00' });
    await user.click(screen.getByLabelText(/hour/i));
    const minuteList = screen.getByRole('listbox', { name: /minute/i });
    await user.click(within(minuteList).getByRole('option', { name: '30' }));
    expect(onChange).toHaveBeenLastCalledWith('10:30');
    expect(screen.queryByRole('listbox', { name: /hour/i })).toBeNull();
  });
});
