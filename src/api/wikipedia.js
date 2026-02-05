const API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const FETCH_TIMEOUT_MS = 10000;

export class RateLimitError extends Error {
  constructor(retryAfter = null) {
    super('RATE_LIMITED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('TIMEOUT');
    this.name = 'TimeoutError';
  }
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      if (!navigator.onLine) {
        throw new Error('OFFLINE');
      }

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        throw new RateLimitError(retryAfter ? Number(retryAfter) : null);
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        clearTimeout(timeoutId);
        if (attempt === retries - 1) throw new TimeoutError();
        await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
        continue;
      }

      if (err instanceof RateLimitError) {
        // Wait longer on rate limit — use Retry-After or exponential backoff
        const waitMs = err.retryAfter
          ? err.retryAfter * 1000
          : delay * Math.pow(2, attempt + 1);
        if (attempt === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function isValidArticle(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.title || typeof data.title !== 'string') return false;
  if (!data.extract || typeof data.extract !== 'string') return false;
  if (data.extract.trim().length <= 30) return false;
  if (!data.pageid && data.pageid !== 0) return false;
  return true;
}

export async function fetchRandomArticles(count = 5) {
  const articles = [];

  const promises = Array.from({ length: count }, () =>
    fetchWithRetry(`${API_BASE}/page/random/summary`, {
      headers: { Accept: 'application/json' },
    })
      .then((data) => {
        if (!isValidArticle(data)) return null;
        return {
          id: data.pageid,
          title: data.title,
          displayTitle: data.displaytitle || data.title,
          extract: data.extract || '',
          extractHtml: data.extract_html || '',
          description: data.description || '',
          thumbnail: data.thumbnail?.source || null,
          originalImage: data.originalimage?.source || null,
          url:
            data.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
          lang: data.lang || 'en',
          timestamp: data.timestamp || null,
        };
      })
      .catch((err) => {
        // Propagate rate limit and timeout errors so the caller can handle them
        if (err instanceof RateLimitError || err instanceof TimeoutError) {
          throw err;
        }
        return null;
      })
  );

  let results;
  try {
    results = await Promise.all(promises);
  } catch (err) {
    // If any single fetch threw a rate limit or timeout, propagate it
    throw err;
  }

  for (const article of results) {
    if (article) {
      articles.push(article);
    }
  }

  if (articles.length === 0 && !navigator.onLine) {
    throw new Error('OFFLINE');
  }

  if (articles.length === 0) {
    throw new Error('NO_ARTICLES');
  }

  return articles;
}
