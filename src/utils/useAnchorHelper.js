import { useCallback, useState } from 'react';

const STORAGE_KEY = 'kzone-anchor';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function useAnchorHelper() {
  const [state, setState] = useState(load);

  const setAnchor = useCallback((anchor) => {
    setState((prev) => {
      const next = { ...prev, anchor };
      save(next);
      return next;
    });
  }, []);

  const setActual = useCallback((actual) => {
    setState((prev) => {
      const next = { ...prev, actual };
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setState({});
    save({});
  }, []);

  return {
    anchor: state.anchor ?? null,
    actual: state.actual ?? null,
    setAnchor,
    setActual,
    clear,
  };
}
