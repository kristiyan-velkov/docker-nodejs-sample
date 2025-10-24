import type { TodoItem as TodoItemType } from '@/shared/types/todo';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TodoItem } from '../TodoItem';

const mockTodo: TodoItemType = {
  id: '1',
  name: 'Test Todo',
  completed: false,
};

const mockCompletedTodo: TodoItemType = {
  id: '2',
  name: 'Completed Todo',
  completed: true,
};

describe('TodoItem', () => {
  it('renders todo item correctly', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders completed todo item correctly', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockCompletedTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });

  it('calls onUpdate when checkbox is clicked', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const checkbox = screen.getByRole('button', { name: '' }); // The checkbox button
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', { completed: true });
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn().mockResolvedValue(undefined);

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    confirmSpy.mockRestore();
  });

  it('applies correct CSS classes for completed items', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockCompletedTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const todoText = screen.getByText('Completed Todo');
    expect(todoText.parentElement).toHaveClass('line-through', 'text-gray-500');
  });

  it('applies correct CSS classes for incomplete items', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const todoText = screen.getByText('Test Todo');
    expect(todoText.parentElement).not.toHaveClass('line-through', 'text-gray-500');
  });

  it('enters edit mode when todo text is clicked', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const todoText = screen.getByText('Test Todo');
    fireEvent.click(todoText);

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('saves changes when save button is clicked', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    // Enter edit mode
    const todoText = screen.getByText('Test Todo');
    fireEvent.click(todoText);

    // Change the text
    const input = screen.getByDisplayValue('Test Todo');
    fireEvent.change(input, { target: { value: 'Updated Todo' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', { name: 'Updated Todo' });
    });
  });
});
