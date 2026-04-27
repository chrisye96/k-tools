import { useState, useRef } from 'react';
import { cities } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './CitySelect.css';

export default function CitySelect({ value, onChange, placeholder }) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);

  const effectivePlaceholder = placeholder ?? t('cities.searchPlaceholder');

  const filtered = query.length === 0
    ? cities
    : cities.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const popularItems = filtered.filter((c) => c.popular);
  const otherItems = filtered.filter((c) => !c.popular);
  const allItems = [...popularItems, ...otherItems];

  function handleSelect(city) {
    onChange(city);
    setQuery('');
    setOpen(false);
    setFocusedIndex(-1);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setOpen(true);
        setFocusedIndex(0);
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && focusedIndex >= 0) handleSelect(allItems[focusedIndex]);
  }

  const displayValue = open ? query : (value ? value.label : query);

  return (
    <div className="city-select" role="combobox" aria-expanded={open} aria-haspopup="listbox">
      <input
        ref={inputRef}
        type="text"
        className="city-select__input"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setFocusedIndex(-1);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={effectivePlaceholder}
        aria-autocomplete="list"
        aria-controls="city-select-list"
        aria-activedescendant={focusedIndex >= 0 ? `city-opt-${focusedIndex}` : undefined}
      />
      {open && (
        <ul id="city-select-list" className="city-select__list" role="listbox">
          {query.length === 0 && popularItems.length > 0 && (
            <li className="city-select__group-label" aria-hidden="true">{t('cities.popularGroupLabel')}</li>
          )}
          {allItems.map((city, i) => {
            const isFirstOther = query.length === 0 && i === popularItems.length && otherItems.length > 0;
            return (
              <li
                key={city.timezone}
                id={`city-opt-${i}`}
                role="option"
                aria-selected={value?.timezone === city.timezone}
                className={[
                  'city-select__option',
                  focusedIndex === i && 'city-select__option--focused',
                  isFirstOther && 'city-select__option--first-other',
                ].filter(Boolean).join(' ')}
                onMouseDown={() => handleSelect(city)}
              >
                {city.label}
              </li>
            );
          })}
          {allItems.length === 0 && (
            <li className="city-select__empty">{t('cities.noMatches')}</li>
          )}
        </ul>
      )}
    </div>
  );
}
