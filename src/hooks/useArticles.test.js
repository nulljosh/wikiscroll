import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArticles } from './useArticles';

const mockArticle = {
  id: 123,
  title: 'Test Article',
  displayTitle: 'Test Article',
  extract: 'This is a test extract that is long enough to pass the filter check.',
  extractHtml: '<p>This is a test extract.</p>',
  description: 'A test article',
  thumbnail: null,
  originalImage: null,
  url: 'https://en.wikipedia.org/wiki/Test_Article',
  lang: 'en',
  timestamp: null,
};

vi.mock('../api/wikipedia', () => ({
  fetchRandomArticles: vi.fn(),
}));

import { fetchRandomArticles } from '../api/wikipedia';

describe('useArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with initial loading state', () => {
    fetchRandomArticles.mockResolvedValue([]);
    const { result } = renderHook(() => useArticles());

    expect(result.current.articles).toEqual([]);
    expect(result.current.initialLoading).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads articles successfully', async () => {
    fetchRandomArticles.mockResolvedValue([mockArticle]);

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.articles).toHaveLength(1);
    expect(result.current.articles[0].title).toBe('Test Article');
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.articles).toHaveLength(0);
    expect(result.current.error).toBe('Failed to load articles. Please try again.');
  });

  it('handles offline errors', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('OFFLINE'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.error).toBe('offline');
  });

  it('deduplicates articles', async () => {
    fetchRandomArticles.mockResolvedValue([mockArticle]);

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.articles).toHaveLength(1);
  });

  it('clears error with clearError', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
