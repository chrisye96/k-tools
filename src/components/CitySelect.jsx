import { useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { cities } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './CitySelect.css';

// Single Fuse instance per module — cities is a static module-level array.
// threshold: 0.3 tolerates light typos (e.g. "Tokio" -> Tokyo, "Calgry" ->
//   Calgary) without matching unrelated cities; ignoreLocation lets matches
//   land anywhere in the string. Label is weighted higher so canonical names
//   win when both label and an alias would match the query.
const fuse = new Fuse(cities, {
  keys: [
    { name: 'label', weight: 2 },
    { name: 'searchable', weight: 1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 1,
});

function pickAliasHit(result, lowerQuery) {
  const labelLower = result.item.label.toLowerCase();
  if (labelLower.includes(lowerQuery)) return null;
  const aliasMatch = result.matches?.find(
    (m) => m.key === 'searchable' && m.value && !labelLower.includes(m.value.toLowerCase()),
  );
  return aliasMatch?.value ?? null;
}

export default function CitySelect({ value, onChange, placeholder }) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);

  const effectivePlaceholder = placeholder ?? t('cities.searchPlaceholder');
  const lowerQuery = query.toLowerCase();

  // When query is empty: show popular-first ordering (canonical mainCities[0]
  // grouping). When query is non-empty: defer to Fuse's relevance ordering.
  const entries = useMemo(() => {
    if (query.length === 0) {
      const popular = cities.filter((c) => c.popular).map((c) => ({ item: c, aliasHit: null }));
      const others = cities.filter((c) => !c.popular).map((c) => ({ item: c, aliasHit: null }));
      return { all: [...popular, ...others], popularCount: popular.length, isSearch: false };
    }
    const all = fuse.search(query).map((r) => ({
      item: r.item,
      aliasHit: pickAliasHit(r, lowerQuery),
    }));
    return { all, popularCount: 0, isSearch: true };
  }, [query, lowerQuery]);

  const allEntries = entries.all;

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
      setFocusedIndex((i) => Math.min(i + 1, allEntries.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && focusedIndex >= 0) handleSelect(allEntries[focusedIndex].item);
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
          {!entries.isSearch && entries.popularCount > 0 && (
            <li className="city-select__group-label" aria-hidden="true">{t('cities.popularGroupLabel')}</li>
          )}
          {allEntries.map((entry, i) => {
            const city = entry.item;
            const isFirstOther = !entries.isSearch && i === entries.popularCount && entries.popularCount < allEntries.length;
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
                {entry.aliasHit ? (
                  <>
                    <span className="city-select__option-label">{entry.aliasHit}</span>
                    <span className="city-select__option-alias"> | {city.label}</span>
                  </>
                ) : (
                  <span className="city-select__option-label">{city.label}</span>
                )}
              </li>
            );
          })}
          {allEntries.length === 0 && (
            <li className="city-select__empty">{t('cities.noMatches')}</li>
          )}
        </ul>
      )}
    </div>
  );
}
