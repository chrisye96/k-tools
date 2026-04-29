import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function wrap({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with an empty toast queue', () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrap });
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast appends a new toast and returns its id', () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrap });
    let id;
    act(() => {
      id = result.current.showToast('hello');
    });
    expect(typeof id).toBe('number');
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('hello');
  });

  it('auto-dismisses after the configured duration', () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrap });
    act(() => result.current.showToast('bye', { duration: 1000 }));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(999));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('duration: 0 keeps the toast indefinitely', () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrap });
    act(() => result.current.showToast('sticky', { duration: 0 }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.toasts).toHaveLength(1);
  });

  it('dismissToast removes by id and clears the timer', () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrap });
    let id;
    act(() => {
      id = result.current.showToast('one', { duration: 5000 });
    });
    act(() => result.current.dismissToast(id));
    expect(result.current.toasts).toHaveLength(0);
    // Advancing timers should not re-trigger anything destructive
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('throws if useToast is used outside the provider', () => {
    expect(() => renderHook(() => useToast())).toThrow();
  });
});
