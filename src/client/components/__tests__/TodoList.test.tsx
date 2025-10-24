import type { TodoItem } from '@/shared/types/todo';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TodoList } from '../TodoList';

const mockTodos: TodoItem[] = [
  { id: '1', name: 'First Todo', completed: false },
  { id: '2', name: 'Second Todo', completed: true },
  { id: '3', name: 'Third Todo', completed: false },
];

describe('TodoList', () => {
  it('renders empty state when no todos', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={[]} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Ready to get organized?')).toBeInTheDocument();
    expect(screen.getByText(/Start your productivity journey/)).toBeInTheDocument();
  });

  it('renders all todos when provided', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={mockTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();
  });

  it('separates todos into active and completed sections', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={mockTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();

    // Check section counts
    expect(screen.getByText('2')).toBeInTheDocument(); // Active count
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed count
  });

  it('renders todos in correct sections', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={mockTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    // Active todos should be in active section
    const activeSection = screen.getByText('Active Tasks').closest('section');
    expect(activeSection).toContainElement(screen.getByText('First Todo'));
    expect(activeSection).toContainElement(screen.getByText('Third Todo'));

    // Completed todos should be in completed section
    const completedSection = screen.getByText('Completed Tasks').closest('section');
    expect(completedSection).toContainElement(screen.getByText('Second Todo'));
  });

  it('shows progress statistics', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={mockTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Total: 3 items')).toBeInTheDocument();
    expect(screen.getByText('Active: 2')).toBeInTheDocument();
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
    expect(screen.getByText('33% Complete')).toBeInTheDocument();
  });

  it('handles single todo correctly', () => {
    const singleTodo: TodoItem[] = [{ id: '1', name: 'Single Todo', completed: false }];
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={singleTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Single Todo')).toBeInTheDocument();
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    expect(screen.queryByText('Completed Tasks')).not.toBeInTheDocument();
    expect(screen.getByText('Total: 1 items')).toBeInTheDocument();
  });

  it('handles all completed todos', () => {
    const completedTodos: TodoItem[] = [
      { id: '1', name: 'Done Todo 1', completed: true },
      { id: '2', name: 'Done Todo 2', completed: true },
    ];
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={completedTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
    expect(screen.getByText('100% Complete 🎉')).toBeInTheDocument();
  });

  it('passes correct props to TodoItem components', () => {
    const mockOnUpdate = vi.fn();
    const mockOnDelete = vi.fn();

    render(<TodoList todos={mockTodos} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    // All todos should be rendered
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();

    // Completed todo should show completion indicator
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });
});
