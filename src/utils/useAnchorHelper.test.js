import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAnchorHelper from './useAnchorHelper';

beforeEach(() => localStorage.clear());

describe('useAnchorHelper', () => {
  it('starts with both fields null', () => {
    const { result } = renderHook(() => useAnchorHelper());
    expect(result.current.anchor).toBeNull();
    expect(result.current.actual).toBeNull();
  });

  it('persists setAnchor + setActual to localStorage', () => {
    const { result } = renderHook(() => useAnchorHelper());
    act(() => {
      result.current.setAnchor('05:00');
      result.current.setActual('06:00');
    });
    expect(result.current.anchor).toBe('05:00');
    expect(result.current.actual).toBe('06:00');
    expect(JSON.parse(localStorage.getItem('kzone-anchor'))).toEqual({
      anchor: '05:00',
      actual: '06:00',
    });
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('kzone-anchor', JSON.stringify({ anchor: '07:30', actual: '06:15' }));
    const { result } = renderHook(() => useAnchorHelper());
    expect(result.current.anchor).toBe('07:30');
    expect(result.current.actual).toBe('06:15');
  });

  it('clear empties both fields and persists empty', () => {
    const { result } = renderHook(() => useAnchorHelper());
    act(() => {
      result.current.setAnchor('05:00');
      result.current.setActual('06:00');
    });
    act(() => result.current.clear());
    expect(result.current.anchor).toBeNull();
    expect(result.current.actual).toBeNull();
    expect(localStorage.getItem('kzone-anchor')).toBe('{}');
  });
});
