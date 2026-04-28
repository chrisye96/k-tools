import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'kzone-favorites';

function storageKey(scope) {
  return `${STORAGE_PREFIX}-${scope}`;
}

function load(scope) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(scope)) ?? '[]');
  } catch {
    return [];
  }
}

function save(scope, list) {
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * Tracks an IANA-timezone allow list scoped to a string key, e.g.
 * `useFavorites('reverse')` and `useFavorites('forward')` keep separate
 * arrays in localStorage so starring in one section does not bleed into
 * the other.
 *
 * Optional `cap` enforces a hard maximum (e.g. pinned has cap 5);
 * exceeding the cap silently drops the addFavorite call.
 */
export default function useFavorites(scope, options = {}) {
  if (!scope) {
    throw new Error('useFavorites: a scope key is required');
  }
  const { cap } = options;
  const [favorites, setFavorites] = useState(() => load(scope));

  const addFavorite = useCallback(
    (ianaTimezone) => {
      setFavorites((prev) => {
        if (prev.includes(ianaTimezone)) return prev;
        if (typeof cap === 'number' && prev.length >= cap) return prev;
        const next = [...prev, ianaTimezone];
        save(scope, next);
        return next;
      });
    },
    [scope, cap],
  );

  const removeFavorite = useCallback(
    (ianaTimezone) => {
      setFavorites((prev) => {
        const next = prev.filter((tz) => tz !== ianaTimezone);
        save(scope, next);
        return next;
      });
    },
    [scope],
  );

  const isFavorite = useCallback(
    (ianaTimezone) => favorites.includes(ianaTimezone),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
