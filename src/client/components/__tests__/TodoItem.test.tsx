import { TodoItem as TodoType } from '@/shared/types/todo.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TodoItem } from '../TodoItem.js';

describe('TodoItem Component', () => {
  const mockTodo: TodoType = {
    id: 'test-id',
    name: 'Test Todo',
    completed: false,
  };

  const defaultProps = {
    todo: mockTodo,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo item correctly', () => {
    render(<TodoItem {...defaultProps} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem {...defaultProps} todo={completedTodo} />);

    const todoText = screen.getByText('Test Todo');
    expect(todoText).toHaveClass('line-through');
  });

  it('toggles completion status when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    const checkbox = screen.getByRole('button').querySelector('svg')?.parentElement;
    if (checkbox) {
      await user.click(checkbox);
    }

    expect(defaultProps.onUpdate).toHaveBeenCalledWith('test-id', { completed: true });
  });

  it('enters edit mode when todo text is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    await user.click(screen.getByText('Test Todo'));

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('saves changes when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    // Enter edit mode
    await user.click(screen.getByText('Test Todo'));

    // Edit the text
    const input = screen.getByDisplayValue('Test Todo');
    await user.clear(input);
    await user.type(input, 'Updated Todo');

    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith('test-id', { name: 'Updated Todo' });
  });

  it('cancels edit when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    // Enter edit mode
    await user.click(screen.getByText('Test Todo'));

    // Edit the text
    const input = screen.getByDisplayValue('Test Todo');
    await user.clear(input);
    await user.type(input, 'Changed Text');

    // Cancel changes
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should show original text
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });

  it('saves changes when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    // Enter edit mode
    await user.click(screen.getByText('Test Todo'));

    // Edit the text and press Enter
    const input = screen.getByDisplayValue('Test Todo');
    await user.clear(input);
    await user.type(input, 'Updated Todo{enter}');

    expect(defaultProps.onUpdate).toHaveBeenCalledWith('test-id', { name: 'Updated Todo' });
  });

  it('cancels edit when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    // Enter edit mode
    await user.click(screen.getByText('Test Todo'));

    // Edit the text and press Escape
    const input = screen.getByDisplayValue('Test Todo');
    await user.clear(input);
    await user.type(input, 'Changed Text{escape}');

    // Should show original text
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
    
    render(<TodoItem {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    expect(defaultProps.onDelete).toHaveBeenCalledWith('test-id');
    
    vi.unstubAllGlobals();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm to return false
    vi.stubGlobal('confirm', vi.fn(() => false));
    
    render(<TodoItem {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
    
    vi.unstubAllGlobals();
  });

  it('does not save empty todo name', async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    // Enter edit mode
    await user.click(screen.getByText('Test Todo'));

    // Clear the text
    const input = screen.getByDisplayValue('Test Todo');
    await user.clear(input);

    // Try to save empty
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Should revert to original text and not call onUpdate
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', async () => {
    const user = userEvent.setup();
    
    // Make onUpdate return a pending promise
    const slowUpdate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<TodoItem {...defaultProps} onUpdate={slowUpdate} />);

    const checkbox = screen.getByRole('button').querySelector('svg')?.parentElement;
    if (checkbox) {
      await user.click(checkbox);
    }

    // Should show loading state
    const container = checkbox?.closest('.card');
    expect(container).toHaveClass('opacity-50');
  });
});
