import { describe, expect, it } from 'vitest';
import { createTodoSchema, todoIdSchema, updateTodoSchema } from '../validation';

describe('Validation Schemas', () => {
  describe('createTodoSchema', () => {
    it('should validate valid todo creation data', () => {
      const validData = { name: 'Test Todo' };
      const result = createTodoSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject empty name', () => {
      const invalidData = { name: '' };
      const result = createTodoSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required');
      }
    });

    it('should reject name that is too long', () => {
      const invalidData = { name: 'a'.repeat(256) };
      const result = createTodoSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name too long');
      }
    });

    it('should reject missing name', () => {
      const invalidData = {};
      const result = createTodoSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });

  describe('updateTodoSchema', () => {
    it('should validate partial update data', () => {
      const validData = { name: 'Updated Todo' };
      const result = updateTodoSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate completed field', () => {
      const validData = { completed: true };
      const result = updateTodoSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate both fields', () => {
      const validData = { name: 'Updated Todo', completed: true };
      const result = updateTodoSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate empty object', () => {
      const validData = {};
      const result = updateTodoSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
    });
  });

  describe('todoIdSchema', () => {
    it('should validate valid UUID', () => {
      const validData = { id: '123e4567-e89b-12d3-a456-426614174000' };
      const result = todoIdSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidData = { id: 'invalid-uuid' };
      const result = todoIdSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid todo ID format');
      }
    });

    it('should reject missing id', () => {
      const invalidData = {};
      const result = todoIdSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});
