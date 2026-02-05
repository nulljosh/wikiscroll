import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchRandomArticles, RateLimitError, TimeoutError } from '../api/wikipedia';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);

  const loadMore = useCallback(async (count = 5) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const newArticles = await fetchRandomArticles(count);
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique = newArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...unique];
      });
      retryCountRef.current = 0;
    } catch (err) {
      console.error('Failed to load articles:', err);

      if (err instanceof RateLimitError) {
        setError('rate_limited');
      } else if (err instanceof TimeoutError) {
        setError('timeout');
      } else if (err.message === 'OFFLINE') {
        setError('offline');
      } else if (err.message === 'NO_ARTICLES') {
        setError('no_articles');
      } else {
        setError('Failed to load articles. Please try again.');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Auto-retry when coming back online
  useEffect(() => {
    const handleOnline = () => {
      // Only auto-retry if we have an offline error or had no articles
      setError((currentError) => {
        if (currentError === 'offline') {
          // Schedule retry outside of setState
          setTimeout(() => loadMore(articles.length === 0 ? 8 : 5), 500);
        }
        return currentError;
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadMore, articles.length]);

  const clearError = useCallback(() => setError(null), []);

  return { articles, loading, initialLoading, error, loadMore, clearError };
}
