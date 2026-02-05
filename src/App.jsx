import { useEffect, useRef, useCallback } from 'react';
import { useArticles } from './hooks/useArticles';
import ArticleCard from './components/ArticleCard';
import Loader from './components/Loader';
import './App.css';

export default function App() {
  const { articles, loading, initialLoading, loadMore } = useArticles();
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const lastCardRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore(5);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, loadMore]
  );

  // Initial load
  useEffect(() => {
    loadMore(8);
  }, []);

  if (initialLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">
          <span className="logo-icon">📚</span>
          WikiScroll
        </h1>
      </header>

      <div className="scroll-container" ref={containerRef}>
        {articles.map((article, index) => {
          const isLast = index === articles.length - 2;
          return (
            <div
              key={article.id}
              ref={isLast ? lastCardRef : null}
            >
              <ArticleCard article={article} index={index} />
            </div>
          );
        })}

        {loading && <Loader />}
      </div>
    </div>
  );
}
