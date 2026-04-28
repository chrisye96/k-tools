import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFavorites from './useFavorites';

beforeEach(() => localStorage.clear());

describe('useFavorites', () => {
  it('throws if no scope is provided', () => {
    expect(() => renderHook(() => useFavorites())).toThrow();
  });

  it('starts empty for a fresh scope', () => {
    const { result } = renderHook(() => useFavorites('reverse'));
    expect(result.current.favorites).toEqual([]);
  });

  it('adds a favorite scoped to the given key', () => {
    const { result } = renderHook(() => useFavorites('reverse'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.favorites).toContain('Asia/Tokyo');
    expect(JSON.parse(localStorage.getItem('kzone-favorites-reverse'))).toContain('Asia/Tokyo');
  });

  it('keeps separate arrays per scope', () => {
    const reverse = renderHook(() => useFavorites('reverse'));
    const forward = renderHook(() => useFavorites('forward'));
    act(() => reverse.result.current.addFavorite('Asia/Tokyo'));
    expect(reverse.result.current.favorites).toContain('Asia/Tokyo');
    expect(forward.result.current.favorites).not.toContain('Asia/Tokyo');
  });

  it('removes a favorite', () => {
    const { result } = renderHook(() => useFavorites('reverse'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    act(() => result.current.removeFavorite('Asia/Tokyo'));
    expect(result.current.favorites).not.toContain('Asia/Tokyo');
  });

  it('does not add duplicates', () => {
    const { result } = renderHook(() => useFavorites('reverse'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.favorites.filter((f) => f === 'Asia/Tokyo')).toHaveLength(1);
  });

  it('respects an optional cap (silent drop on overflow)', () => {
    const { result } = renderHook(() => useFavorites('pinned', { cap: 2 }));
    act(() => {
      result.current.addFavorite('a');
      result.current.addFavorite('b');
      result.current.addFavorite('c');
    });
    expect(result.current.favorites).toEqual(['a', 'b']);
  });

  it('isFavorite returns correct boolean', () => {
    const { result } = renderHook(() => useFavorites('reverse'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.isFavorite('Asia/Tokyo')).toBe(true);
    expect(result.current.isFavorite('America/New_York')).toBe(false);
  });

  it('persists across hook remounts within the same scope', () => {
    const { result, rerender } = renderHook(() => useFavorites('reverse'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    rerender();
    expect(result.current.favorites).toContain('Asia/Tokyo');
  });
});
