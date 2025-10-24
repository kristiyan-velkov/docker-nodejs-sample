import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddTodoForm } from '../AddTodoForm';

describe('AddTodoForm', () => {
  it('renders form elements correctly', () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    expect(screen.getByPlaceholderText('What needs to be done? ✨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
    expect(screen.getByText('Add New Todo')).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New todo item' } });

    expect(input.value).toBe('New todo item');
  });

  it('calls onAdd with correct value when form is submitted', async () => {
    const mockOnAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('New todo item');
    });
  });

  it('clears input after successful submission', async () => {
    const mockOnAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('does not submit empty todo', async () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnAdd).not.toHaveBeenCalled();
      expect(screen.getByText('Todo name is required')).toBeInTheDocument();
    });
  });

  it('trims whitespace from input', async () => {
    const mockOnAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: '  New todo item  ' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('New todo item');
    });
  });

  it('shows loading state during submission', async () => {
    const mockOnAdd = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });
  });

  it('handles submission errors gracefully', async () => {
    const mockOnAdd = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('submits form when Enter key is pressed', async () => {
    const mockOnAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done? ✨');

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('New todo item');
    });
  });

  it('clears error when user starts typing', async () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    // First trigger an error by submitting empty form
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Todo name is required')).toBeInTheDocument();
    });

    // Then start typing
    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    fireEvent.change(input, { target: { value: 'New todo' } });

    expect(screen.queryByText('Todo name is required')).not.toBeInTheDocument();
  });

  it('disables button when input is empty', () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    const button = screen.getByRole('button', { name: /add todo/i });
    expect(button).toBeDisabled();

    const input = screen.getByPlaceholderText('What needs to be done? ✨');
    fireEvent.change(input, { target: { value: 'New todo' } });

    expect(button).not.toBeDisabled();
  });

  it('shows helpful hint text', () => {
    const mockOnAdd = vi.fn();

    render(<AddTodoForm onAdd={mockOnAdd} />);

    expect(screen.getByText('Press Enter to quickly add, or click the button')).toBeInTheDocument();
  });
});
