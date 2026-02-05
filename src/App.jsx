import { useEffect, useRef, useCallback, useState } from 'react';
import { useArticles } from './hooks/useArticles';
import ArticleCard from './components/ArticleCard';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorMessage from './components/ErrorMessage';
import Loader from './components/Loader';
import './App.css';

function AppContent() {
  const { articles, loading, initialLoading, error, loadMore, clearError } =
    useArticles();
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef(false);

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

  // Auto-scroll
  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container || !autoScrollRef.current) return;

      const cardHeight = container.clientHeight;
      container.scrollBy({ top: cardHeight, behavior: 'smooth' });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  // Pause auto-scroll on user interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStarted = false;

    const handleTouchStart = () => {
      touchStarted = true;
      if (autoScrollRef.current) setAutoScroll(false);
    };

    const handleWheel = () => {
      if (autoScrollRef.current) setAutoScroll(false);
    };

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleRetry = () => {
    clearError();
    loadMore(articles.length === 0 ? 8 : 5);
  };

  if (initialLoading) {
    return <Loader fullScreen />;
  }

  if (error && articles.length === 0) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-logo">
            <span className="logo-icon">📚</span>
            WikiScroll
          </h1>
        </header>
        <ErrorMessage error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">
          <span className="logo-icon">📚</span>
          WikiScroll
        </h1>
      </header>

      <button
        className={`auto-scroll-btn ${autoScroll ? 'active' : ''}`}
        onClick={() => setAutoScroll((s) => !s)}
        aria-label={autoScroll ? 'Pause auto-scroll' : 'Start auto-scroll'}
        title={autoScroll ? 'Pause auto-scroll' : 'Start auto-scroll'}
      >
        {autoScroll ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <div className="scroll-container" ref={containerRef}>
        {articles.map((article, index) => {
          const isLast = index === articles.length - 2;
          return (
            <div key={article.id} ref={isLast ? lastCardRef : null}>
              <ArticleCard article={article} index={index} />
            </div>
          );
        })}

        {error && <ErrorMessage error={error} onRetry={handleRetry} />}

        {loading && <Loader />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
