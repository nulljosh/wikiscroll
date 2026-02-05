import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders offline message when error is offline', () => {
    render(<ErrorMessage error="offline" onRetry={() => {}} />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
  });

  it('renders generic error message for other errors', () => {
    render(<ErrorMessage error="Something broke" onRetry={() => {}} />);
    expect(screen.getByText('Failed to load articles')).toBeInTheDocument();
  });

  it('renders retry button and calls onRetry when clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage error="error" onRetry={onRetry} />);
    
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage error="error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows correct emoji for offline state', () => {
    render(<ErrorMessage error="offline" />);
    expect(screen.getByText('📡')).toBeInTheDocument();
  });

  it('shows correct emoji for generic error', () => {
    render(<ErrorMessage error="error" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
