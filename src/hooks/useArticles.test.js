import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  RateLimitError: class RateLimitError extends Error {
    constructor(retryAfter) {
      super('RATE_LIMITED');
      this.name = 'RateLimitError';
      this.retryAfter = retryAfter;
    }
  },
  TimeoutError: class TimeoutError extends Error {
    constructor() {
      super('TIMEOUT');
      this.name = 'TimeoutError';
    }
  },
}));

import { fetchRandomArticles, RateLimitError, TimeoutError } from '../api/wikipedia';

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

  it('handles rate limit errors', async () => {
    fetchRandomArticles.mockRejectedValue(new RateLimitError(5));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.error).toBe('rate_limited');
  });

  it('handles timeout errors', async () => {
    fetchRandomArticles.mockRejectedValue(new TimeoutError());

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.error).toBe('timeout');
  });

  it('handles NO_ARTICLES error', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('NO_ARTICLES'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    expect(result.current.error).toBe('no_articles');
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

  it('auto-retries when coming back online from offline error', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('OFFLINE'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(8);
    });

    expect(result.current.error).toBe('offline');

    // Now simulate coming back online
    fetchRandomArticles.mockResolvedValue([mockArticle]);

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      // Wait for the 500ms delay in the handler
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(fetchRandomArticles).toHaveBeenCalledTimes(2);
  });

  it('does not auto-retry on online event if error is not offline', async () => {
    fetchRandomArticles.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useArticles());

    await act(async () => {
      await result.current.loadMore(5);
    });

    const callCount = fetchRandomArticles.mock.calls.length;

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await new Promise((r) => setTimeout(r, 600));
    });

    // Should NOT have retried
    expect(fetchRandomArticles).toHaveBeenCalledTimes(callCount);
  });

  it('sets loading to true during fetch and false after', async () => {
    let resolvePromise;
    fetchRandomArticles.mockImplementation(() => new Promise((r) => { resolvePromise = r; }));

    const { result } = renderHook(() => useArticles());

    let loadPromise;
    act(() => {
      loadPromise = result.current.loadMore(5);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise([mockArticle]);
      await loadPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
