import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CitySelect from './CitySelect';
import { LanguageProvider } from '../contexts/LanguageContext';

const { mockCities } = vi.hoisted(() => ({
  mockCities: [
    { timezone: 'America/New_York', city: 'New York', country: 'United States', label: 'New York, United States', popular: true },
    { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', label: 'Tokyo, Japan', popular: true },
    { timezone: 'Pacific/Chatham', city: 'Chatham', country: 'New Zealand', label: 'Chatham, New Zealand', popular: false },
  ],
}));

vi.mock('../data/cities', () => ({ cities: mockCities }));

function renderCitySelect(props) {
  return render(<LanguageProvider><CitySelect {...props} /></LanguageProvider>);
}

describe('CitySelect', () => {
  it('renders the input with placeholder', () => {
    renderCitySelect({ value: null, onChange: () => {}, placeholder: 'Search...' });
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('shows selected city label in input when not focused', () => {
    const selected = mockCities[0];
    renderCitySelect({ value: selected, onChange: () => {} });
    expect(screen.getByDisplayValue('New York, United States')).toBeInTheDocument();
  });

  it('opens dropdown and shows cities on input focus', async () => {
    const user = userEvent.setup();
    renderCitySelect({ value: null, onChange: () => {} });
    await user.click(screen.getByRole('combobox').querySelector('input'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('New York, United States')).toBeInTheDocument();
  });

  it('filters cities by search query', async () => {
    const user = userEvent.setup();
    renderCitySelect({ value: null, onChange: () => {} });
    const input = screen.getByRole('combobox').querySelector('input');
    await user.click(input);
    await user.type(input, 'Tokyo');
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument();
    expect(screen.queryByText('New York, United States')).not.toBeInTheDocument();
  });

  it('calls onChange with city object when option clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderCitySelect({ value: null, onChange: handleChange });
    await user.click(screen.getByRole('combobox').querySelector('input'));
    await user.click(screen.getByText('New York, United States'));
    expect(handleChange).toHaveBeenCalledWith(mockCities[0]);
  });

  it('navigates with arrow keys and selects with Enter', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderCitySelect({ value: null, onChange: handleChange });
    const input = screen.getByRole('combobox').querySelector('input');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalled();
  });

  it('uses localised default placeholder when none provided', () => {
    renderCitySelect({ value: null, onChange: () => {} });
    expect(screen.getByPlaceholderText(/Search cities/i)).toBeInTheDocument();
  });
});
