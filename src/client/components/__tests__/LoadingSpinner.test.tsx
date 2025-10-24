import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders default loading message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom loading message', () => {
    const customMessage = 'Loading your awesome todos...';

    render(<LoadingSpinner message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<LoadingSpinner />);

    const container = screen.getByText('Loading...').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-12');
  });

  it('contains spinning animation elements', () => {
    render(<LoadingSpinner />);

    // Check for spinning elements (they should have animate-spin class)
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('contains bouncing dots animation', () => {
    render(<LoadingSpinner />);

    // Check for bouncing elements
    const bouncingDots = document.querySelectorAll('.animate-bounce');
    expect(bouncingDots.length).toBe(3);
  });

  it('renders consistently with different messages', () => {
    const { rerender } = render(<LoadingSpinner message="First message" />);

    expect(screen.getByText('First message')).toBeInTheDocument();

    rerender(<LoadingSpinner message="Second message" />);

    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.queryByText('First message')).not.toBeInTheDocument();
  });

  it('handles empty message', () => {
    render(<LoadingSpinner message="" />);

    // Should render empty string
    const messageElement = screen.getByText('', { selector: 'p' });
    expect(messageElement).toBeInTheDocument();
  });

  it('has proper structure with spinner and message', () => {
    render(<LoadingSpinner message="Test loading" />);

    // Check for the main container structure
    const container = screen.getByText('Test loading').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center');

    // Check for message
    expect(screen.getByText('Test loading')).toHaveClass('text-white/80', 'text-lg', 'font-medium');
  });
});
