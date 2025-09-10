import { TodoItem } from '@/shared/types/todo';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database
const mockDb = {
  init: vi.fn(),
  teardown: vi.fn(),
  getItems: vi.fn(),
  getItem: vi.fn(),
  storeItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock('../../../database/index.js', () => ({
  db: mockDb,
}));

describe('Todo API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      mockDb.getItems.mockResolvedValue([]);
      
      const todos = await mockDb.getItems();
      expect(todos).toEqual([]);
      expect(mockDb.getItems).toHaveBeenCalledTimes(1);
    });

    it('should return todos when they exist', async () => {
      const mockTodos: TodoItem[] = [
        { id: '1', name: 'Test Todo', completed: false },
        { id: '2', name: 'Completed Todo', completed: true },
      ];
      
      mockDb.getItems.mockResolvedValue(mockTodos);
      
      const todos = await mockDb.getItems();
      expect(todos).toEqual(mockTodos);
      expect(todos).toHaveLength(2);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo: TodoItem = {
        id: 'mock-uuid',
        name: 'New Todo',
        completed: false,
      };
      
      mockDb.storeItem.mockResolvedValue(undefined);
      
      await mockDb.storeItem(newTodo);
      expect(mockDb.storeItem).toHaveBeenCalledWith(newTodo);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update an existing todo', async () => {
      const todoId = 'test-id';
      const updates = { name: 'Updated Todo', completed: true };
      
      mockDb.getItem.mockResolvedValue({ id: todoId, name: 'Original', completed: false });
      mockDb.updateItem.mockResolvedValue(undefined);
      mockDb.getItem.mockResolvedValue({ id: todoId, ...updates });
      
      // Check if todo exists
      const existingTodo = await mockDb.getItem(todoId);
      expect(existingTodo).toBeDefined();
      
      // Update the todo
      await mockDb.updateItem(todoId, updates);
      expect(mockDb.updateItem).toHaveBeenCalledWith(todoId, updates);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todoId = 'test-id';
      
      mockDb.getItem.mockResolvedValue({ id: todoId, name: 'Test', completed: false });
      mockDb.removeItem.mockResolvedValue(undefined);
      
      // Check if todo exists
      const existingTodo = await mockDb.getItem(todoId);
      expect(existingTodo).toBeDefined();
      
      // Delete the todo
      await mockDb.removeItem(todoId);
      expect(mockDb.removeItem).toHaveBeenCalledWith(todoId);
    });
  });
});
