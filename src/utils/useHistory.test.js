import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useHistory from './useHistory';

beforeEach(() => localStorage.clear());

describe('useHistory', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('adds a history entry', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addToHistory({ type: 'forward', timezone: 'Asia/Tokyo' }));
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].timezone).toBe('Asia/Tokyo');
  });

  it('caps history at 10 entries', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToHistory({ type: 'forward', timezone: `Zone/${i}` });
      }
    });
    expect(result.current.history).toHaveLength(10);
  });

  it('deduplicates by timezone + type, keeping most recent', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addToHistory({ type: 'forward', timezone: 'Asia/Tokyo' });
      result.current.addToHistory({ type: 'forward', timezone: 'Asia/Tokyo' });
    });
    expect(result.current.history.filter((h) => h.timezone === 'Asia/Tokyo')).toHaveLength(1);
  });

  it('clearHistory empties the array and persists empty', () => {
    const { result } = renderHook(() => useHistory());
    act(() => result.current.addToHistory({ type: 'forward', timezone: 'Asia/Tokyo' }));
    act(() => result.current.clearHistory());
    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem('kzone-history')).toBe('[]');
  });
});
