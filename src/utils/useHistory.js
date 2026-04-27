import { useState, useCallback } from 'react';

const STORAGE_KEY = 'kzone-history';
const MAX_HISTORY = 10;

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

export default function useHistory() {
  const [history, setHistory] = useState(load);

  const addToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const deduped = prev.filter(
        (h) => !(h.type === entry.type && h.timezone === entry.timezone),
      );
      const next = [{ ...entry, timestamp: Date.now() }, ...deduped].slice(0, MAX_HISTORY);
      save(next);
      return next;
    });
  }, []);

  return { history, addToHistory };
}
