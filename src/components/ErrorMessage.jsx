import './ErrorMessage.css';

export default function ErrorMessage({ error, onRetry }) {
  const isOffline = error === 'offline';

  return (
    <div className="error-message">
      <div className="error-message-content">
        <span className="error-emoji">{isOffline ? '📡' : '⚠️'}</span>
        <h3 className="error-title">
          {isOffline ? "You're offline" : 'Failed to load articles'}
        </h3>
        <p className="error-text">
          {isOffline
            ? 'Check your internet connection and try again.'
            : 'Something went wrong while fetching articles.'}
        </p>
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            {isOffline ? 'Retry connection' : 'Try again'}
          </button>
        )}
      </div>
    </div>
  );
}
