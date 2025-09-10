import { TodoItem } from '@/shared/types/todo.js';
import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import todosRouter from '../../routes/todos.js';

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

vi.mock('../../database/index.js', () => ({
  db: mockDb,
}));

// Mock UUID generation for predictable tests
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

describe('Todo API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/todos', todosRouter);
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      mockDb.getItems.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
      });
      expect(mockDb.getItems).toHaveBeenCalledTimes(1);
    });

    it('should return all todos when they exist', async () => {
      const mockTodos: TodoItem[] = [
        { id: '1', name: 'Test Todo 1', completed: false },
        { id: '2', name: 'Test Todo 2', completed: true },
      ];

      mockDb.getItems.mockResolvedValue(mockTodos);

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTodos,
      });
    });

    it('should handle database errors', async () => {
      mockDb.getItems.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/todos')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Database error');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      const mockTodo: TodoItem = { id: 'test-id', name: 'Test Todo', completed: false };
      mockDb.getItem.mockResolvedValue(mockTodo);

      const response = await request(app)
        .get('/api/todos/test-id')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTodo,
      });
      expect(mockDb.getItem).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when todo does not exist', async () => {
      mockDb.getItem.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/todos/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Todo not found',
      });
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/todos/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid parameters');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo successfully', async () => {
      const newTodoData = { name: 'New Test Todo' };
      const expectedTodo: TodoItem = {
        id: 'mock-uuid-1234',
        name: 'New Test Todo',
        completed: false,
      };

      mockDb.storeItem.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/todos')
        .send(newTodoData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expectedTodo,
        message: 'Todo created successfully',
      });
      expect(mockDb.storeItem).toHaveBeenCalledWith(expectedTodo);
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for name that is too long', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: 'a'.repeat(256) })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update an existing todo', async () => {
      const todoId = 'test-id';
      const existingTodo: TodoItem = { id: todoId, name: 'Original', completed: false };
      const updateData = { name: 'Updated Todo', completed: true };
      const updatedTodo: TodoItem = { ...existingTodo, ...updateData };

      mockDb.getItem.mockResolvedValueOnce(existingTodo);
      mockDb.updateItem.mockResolvedValue(undefined);
      mockDb.getItem.mockResolvedValueOnce(updatedTodo);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: updatedTodo,
        message: 'Todo updated successfully',
      });
      expect(mockDb.updateItem).toHaveBeenCalledWith(todoId, updateData);
    });

    it('should return 404 when updating non-existent todo', async () => {
      mockDb.getItem.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Todo not found',
      });
    });

    it('should allow partial updates', async () => {
      const todoId = 'test-id';
      const existingTodo: TodoItem = { id: todoId, name: 'Original', completed: false };
      const partialUpdate = { completed: true };

      mockDb.getItem.mockResolvedValueOnce(existingTodo);
      mockDb.updateItem.mockResolvedValue(undefined);
      mockDb.getItem.mockResolvedValueOnce({ ...existingTodo, ...partialUpdate });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send(partialUpdate)
        .expect(200);

      expect(mockDb.updateItem).toHaveBeenCalledWith(todoId, partialUpdate);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todoId = 'test-id';
      const existingTodo: TodoItem = { id: todoId, name: 'To Delete', completed: false };

      mockDb.getItem.mockResolvedValue(existingTodo);
      mockDb.removeItem.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Todo deleted successfully',
      });
      expect(mockDb.removeItem).toHaveBeenCalledWith(todoId);
    });

    it('should return 404 when deleting non-existent todo', async () => {
      mockDb.getItem.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/todos/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Todo not found',
      });
      expect(mockDb.removeItem).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/todos/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid parameters');
    });
  });
});
