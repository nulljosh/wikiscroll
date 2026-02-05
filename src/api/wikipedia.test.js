import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchRandomArticles, RateLimitError, TimeoutError } from './wikipedia';

const validApiResponse = {
  pageid: 42,
  title: 'Test Article',
  displaytitle: 'Test Article',
  extract: 'This is a sufficiently long extract for the article to pass validation checks.',
  extract_html: '<p>This is a test extract.</p>',
  description: 'A test article',
  thumbnail: { source: 'https://example.com/thumb.jpg' },
  originalimage: { source: 'https://example.com/full.jpg' },
  content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Test' } },
  lang: 'en',
  timestamp: '2024-01-01T00:00:00Z',
};

describe('wikipedia API', () => {
  let originalNavigator;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Default to online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and transforms articles correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(validApiResponse),
    });

    const articles = await fetchRandomArticles(1);
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Test Article');
    expect(articles[0].id).toBe(42);
    expect(articles[0].thumbnail).toBe('https://example.com/thumb.jpg');
  });

  it('detects rate limiting (429 response)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => '5' },
    });

    await expect(fetchRandomArticles(1)).rejects.toThrow(RateLimitError);
  });

  it('handles timeout via AbortController', async () => {
    // Simulate a fetch that never resolves (will be aborted)
    globalThis.fetch = vi.fn().mockImplementation((_url, opts) => {
      return new Promise((_resolve, reject) => {
        opts.signal.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      });
    });

    // Speed up timeouts for testing
    vi.useFakeTimers();

    const promise = fetchRandomArticles(1);

    // Advance past 3 retries × 10s timeout + backoff delays
    await vi.advanceTimersByTimeAsync(60000);

    await expect(promise).rejects.toThrow(TimeoutError);

    vi.useRealTimers();
  });

  it('filters out malformed articles (missing title)', async () => {
    const malformed = { pageid: 1, extract: 'Some text that is long enough to pass' };
    const good = { ...validApiResponse, pageid: 2 };

    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? malformed : good;
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
    });

    const articles = await fetchRandomArticles(2);
    // Only the valid article should be included
    expect(articles.length).toBeGreaterThanOrEqual(1);
    expect(articles.every((a) => a.title)).toBe(true);
  });

  it('filters out articles with empty/short extracts', async () => {
    const shortExtract = { ...validApiResponse, pageid: 10, extract: 'Too short' };
    const emptyExtract = { ...validApiResponse, pageid: 11, extract: '' };
    const good = { ...validApiResponse, pageid: 12 };

    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? shortExtract : callCount === 2 ? emptyExtract : good;
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
    });

    const articles = await fetchRandomArticles(3);
    expect(articles).toHaveLength(1);
    expect(articles[0].id).toBe(12);
  });

  it('filters out null responses from failed fetches', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('Network error'));
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve(validApiResponse),
      });
    });

    const articles = await fetchRandomArticles(2);
    // At least the successful one should be there
    expect(articles.length).toBeGreaterThanOrEqual(1);
  });

  it('throws OFFLINE when navigator is offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true });

    await expect(fetchRandomArticles(1)).rejects.toThrow('OFFLINE');
  });

  it('throws NO_ARTICLES when all responses are empty/invalid', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: () => Promise.resolve({ pageid: 1, title: 'X', extract: 'short' }),
    });

    await expect(fetchRandomArticles(1)).rejects.toThrow('NO_ARTICLES');
  });

  it('RateLimitError has retryAfter property', () => {
    const err = new RateLimitError(10);
    expect(err.retryAfter).toBe(10);
    expect(err.message).toBe('RATE_LIMITED');
    expect(err.name).toBe('RateLimitError');
  });

  it('TimeoutError has correct name', () => {
    const err = new TimeoutError();
    expect(err.message).toBe('TIMEOUT');
    expect(err.name).toBe('TimeoutError');
  });
});
