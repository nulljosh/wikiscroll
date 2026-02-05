import { useState, useCallback, useRef } from 'react';
import { fetchRandomArticles } from '../api/wikipedia';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (count = 5) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newArticles = await fetchRandomArticles(count);
      setArticles((prev) => {
        // Deduplicate by id
        const existingIds = new Set(prev.map((a) => a.id));
        const unique = newArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...unique];
      });
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, []);

  return { articles, loading, initialLoading, loadMore };
}
