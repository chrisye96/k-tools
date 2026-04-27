import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFavorites from './useFavorites';

beforeEach(() => localStorage.clear());

describe('useFavorites', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('adds a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.favorites).toContain('Asia/Tokyo');
  });

  it('removes a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite('Asia/Tokyo'));
    act(() => result.current.removeFavorite('Asia/Tokyo'));
    expect(result.current.favorites).not.toContain('Asia/Tokyo');
  });

  it('does not add duplicates', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite('Asia/Tokyo'));
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.favorites.filter((f) => f === 'Asia/Tokyo')).toHaveLength(1);
  });

  it('isFavorite returns correct boolean', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite('Asia/Tokyo'));
    expect(result.current.isFavorite('Asia/Tokyo')).toBe(true);
    expect(result.current.isFavorite('America/New_York')).toBe(false);
  });

  it('persists across hook remounts', () => {
    const { result, rerender } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite('Asia/Tokyo'));
    rerender();
    expect(result.current.favorites).toContain('Asia/Tokyo');
  });
});
