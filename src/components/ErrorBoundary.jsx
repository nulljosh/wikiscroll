import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-icon">💥</span>
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred.</p>
            <button className="btn-retry" onClick={this.handleRetry}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
