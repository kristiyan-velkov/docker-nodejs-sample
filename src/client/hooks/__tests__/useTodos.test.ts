import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTodos } from '../useTodos';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTodos = [
  { id: '1', name: 'Test Todo 1', completed: false },
  { id: '2', name: 'Test Todo 2', completed: true },
];

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty todos and loading state', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches todos on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.todos).toEqual(mockTodos);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/todos',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('handles fetch error correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.todos).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('adds new todo successfully', async () => {
    const newTodo = { id: '3', name: 'New Todo', completed: false };

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock add todo request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: newTodo }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTodo('New Todo');
    });

    expect(result.current.todos).toContainEqual(newTodo);
    expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Todo' }),
    });
  });

  it('handles add todo error', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock failed add request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ success: false, error: 'Invalid input' }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.addTodo('New Todo')).rejects.toThrow();
    });

    expect(result.current.error).toBe('HTTP 400: Bad Request');
  });

  it('updates todo successfully', async () => {
    const updatedTodo = { ...mockTodos[0], completed: true };

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock update request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: updatedTodo }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTodo('1', { completed: true });
    });

    const updatedTodoInState = result.current.todos.find((t) => t.id === '1');
    expect(updatedTodoInState?.completed).toBe(true);
  });

  it('handles update todo error', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock failed update request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ success: false, error: 'Todo not found' }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.updateTodo('1', { completed: true })).rejects.toThrow();
    });

    expect(result.current.error).toBe('HTTP 404: Not Found');
  });

  it('deletes todo successfully', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock delete request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTodo('1');
    });

    expect(result.current.todos).not.toContainEqual(mockTodos[0]);
    expect(result.current.todos.find((t) => t.id === '1')).toBeUndefined();
  });

  it('handles delete todo error', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    // Mock failed delete request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ success: false, error: 'Todo not found' }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteTodo('1')).rejects.toThrow();
    });

    expect(result.current.error).toBe('HTTP 404: Not Found');
    expect(result.current.todos).toContainEqual(mockTodos[0]); // Should still be there
  });

  it('clears error when performing successful operations', async () => {
    // Mock initial fetch failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Mock successful add request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { id: '3', name: 'New Todo', completed: false } }),
    });

    await act(async () => {
      await result.current.addTodo('New Todo');
    });

    expect(result.current.error).toBeNull();
  });

  it('provides refresh functionality', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockTodos }),
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock refresh fetch
    const newTodos = [...mockTodos, { id: '3', name: 'Refreshed Todo', completed: false }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: newTodos }),
    });

    await act(async () => {
      await result.current.refreshTodos();
    });

    expect(result.current.todos).toEqual(newTodos);
  });
});
