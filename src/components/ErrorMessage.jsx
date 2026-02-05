import './ErrorMessage.css';

const ERROR_CONFIG = {
  offline: {
    emoji: '📡',
    title: "You're offline",
    text: 'Check your internet connection and try again.',
    button: 'Retry connection',
  },
  rate_limited: {
    emoji: '🚦',
    title: 'Too many requests',
    text: 'Wikipedia is rate limiting us. Please wait a moment and try again.',
    button: 'Try again',
  },
  timeout: {
    emoji: '⏱️',
    title: 'Request timed out',
    text: 'The request took too long. Check your connection and try again.',
    button: 'Try again',
  },
  no_articles: {
    emoji: '📭',
    title: 'No articles found',
    text: 'No articles could be loaded. Try again in a moment.',
    button: 'Try again',
  },
};

const DEFAULT_CONFIG = {
  emoji: '⚠️',
  title: 'Failed to load articles',
  text: 'Something went wrong while fetching articles.',
  button: 'Try again',
};

export default function ErrorMessage({ error, onRetry }) {
  const config = ERROR_CONFIG[error] || DEFAULT_CONFIG;

  return (
    <div className="error-message">
      <div className="error-message-content">
        <span className="error-emoji">{config.emoji}</span>
        <h3 className="error-title">{config.title}</h3>
        <p className="error-text">{config.text}</p>
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            {config.button}
          </button>
        )}
      </div>
    </div>
  );
}
