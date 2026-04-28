import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useNow from './useNow';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-27T10:00:30Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a Date object on initial render', () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBeInstanceOf(Date);
    expect(result.current.toISOString()).toBe('2026-04-27T10:00:30.000Z');
  });

  it('updates after the next minute boundary', () => {
    const { result } = renderHook(() => useNow());
    const initial = result.current;
    // 30s left until 10:01:00
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current).not.toBe(initial);
    expect(result.current.toISOString()).toBe('2026-04-27T10:01:00.000Z');
  });

  it('continues ticking every minute after the first boundary', () => {
    const { result } = renderHook(() => useNow());
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.toISOString()).toBe('2026-04-27T10:01:00.000Z');
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.toISOString()).toBe('2026-04-27T10:02:00.000Z');
  });

  it('clears the timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useNow());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
