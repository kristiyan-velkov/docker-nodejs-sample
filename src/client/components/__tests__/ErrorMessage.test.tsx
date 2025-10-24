import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    const errorMessage = 'Something went wrong!';

    render(<ErrorMessage error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const errorMessage = 'Network error occurred';
    const mockOnRetry = vi.fn();

    render(<ErrorMessage error={errorMessage} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    const errorMessage = 'Network error occurred';

    render(<ErrorMessage error={errorMessage} />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const errorMessage = 'Network error occurred';
    const mockOnRetry = vi.fn();

    render(<ErrorMessage error={errorMessage} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling classes', () => {
    const errorMessage = 'Test error';

    render(<ErrorMessage error={errorMessage} />);

    // Get the outermost container
    const container = document.querySelector('.p-6');
    expect(container).toHaveClass('p-6', 'bg-gradient-to-r', 'from-red-50', 'to-pink-50');
  });

  it('handles empty message gracefully', () => {
    render(<ErrorMessage error="" />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('handles long error messages', () => {
    const longMessage =
      'This is a very long error message that should still be displayed correctly even when it contains a lot of text and might wrap to multiple lines in the UI.';

    render(<ErrorMessage error={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('displays error icon', () => {
    const errorMessage = 'Test error';

    render(<ErrorMessage error={errorMessage} />);

    // Check for the error icon SVG by looking for the SVG element
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
