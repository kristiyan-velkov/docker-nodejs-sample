import { ApiResponse } from '@/shared/types/api';
import { TodoItem } from '@/shared/types/todo';
import { useCallback, useEffect, useState } from 'react';

interface UseTodosReturn {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
  addTodo: (name: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (error: unknown) => {
    console.error('API Error:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const apiRequest = async <T>(url: string, options?: any): Promise<T> => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const refreshTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest<ApiResponse<TodoItem[]>>('/api/todos');

      if (response.success && response.data) {
        setTodos(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch todos');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (name: string) => {
    try {
      setError(null);

      const response = await apiRequest<ApiResponse<TodoItem>>('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      if (response.success && response.data) {
        setTodos((prev) => [response.data!, ...prev]);
      } else {
        throw new Error(response.error || 'Failed to add todo');
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<TodoItem>) => {
    try {
      setError(null);

      const response = await apiRequest<ApiResponse<TodoItem>>(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.success && response.data) {
        setTodos((prev) => prev.map((todo) => (todo.id === id ? response.data! : todo)));
      } else {
        throw new Error(response.error || 'Failed to update todo');
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);

      const response = await apiRequest<ApiResponse>(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      } else {
        throw new Error(response.error || 'Failed to delete todo');
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    refreshTodos,
  };
};
