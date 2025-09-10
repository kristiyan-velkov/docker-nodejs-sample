import { TodoItem } from '@/shared/types/todo.js';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTodos } from '../../hooks/useTodos.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useTodos Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTodos: TodoItem[] = [
    { id: '1', name: 'Test Todo 1', completed: false },
    { id: '2', name: 'Test Todo 2', completed: true },
  ];

  const createMockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ success: true, data: [] })
      );

      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe('refreshTodos', () => {
    it('should fetch todos successfully', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ success: true, data: mockTodos })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle unsuccessful API response', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ success: false, error: 'Server error' })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Server error');
    });

    it('should handle HTTP error status codes', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ message: 'Not Found' }, false, 404)
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Not Found');
    });
  });

  describe('addTodo', () => {
    it('should add a new todo successfully', async () => {
      const newTodo: TodoItem = { id: '3', name: 'New Todo', completed: false };
      
      // Mock initial fetch
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      // Mock add todo
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: newTodo })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addTodo('New Todo');
      });

      expect(result.current.todos).toEqual([...mockTodos, newTodo]);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Todo' }),
      });
    });

    it('should handle add todo errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      mockFetch.mockRejectedValueOnce(new Error('Failed to add'));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addTodo('New Todo');
        })
      ).rejects.toThrow('Failed to add');

      expect(result.current.error).toBe('Failed to add');
    });
  });

  describe('updateTodo', () => {
    it('should update a todo successfully', async () => {
      const updatedTodo: TodoItem = { ...mockTodos[0], completed: true };
      
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: updatedTodo })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateTodo('1', { completed: true });
      });

      expect(result.current.todos[0]).toEqual(updatedTodo);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
    });

    it('should handle update todo errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      mockFetch.mockRejectedValueOnce(new Error('Failed to update'));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateTodo('1', { completed: true });
        })
      ).rejects.toThrow('Failed to update');

      expect(result.current.error).toBe('Failed to update');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(result.current.todos).toEqual(mockTodos.filter(todo => todo.id !== '1'));
      expect(mockFetch).toHaveBeenLastCalledWith('/api/todos/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle delete todo errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, data: mockTodos })
      );
      
      mockFetch.mockRejectedValueOnce(new Error('Failed to delete'));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteTodo('1');
        })
      ).rejects.toThrow('Failed to delete');

      expect(result.current.error).toBe('Failed to delete');
    });
  });
});
