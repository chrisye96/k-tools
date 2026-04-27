import { useState, useCallback } from 'react';

const STORAGE_KEY = 'kzone-favorites';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(load);

  const addFavorite = useCallback((ianaTimezone) => {
    setFavorites((prev) => {
      if (prev.includes(ianaTimezone)) return prev;
      const next = [...prev, ianaTimezone];
      save(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((ianaTimezone) => {
    setFavorites((prev) => {
      const next = prev.filter((tz) => tz !== ianaTimezone);
      save(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (ianaTimezone) => favorites.includes(ianaTimezone),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
