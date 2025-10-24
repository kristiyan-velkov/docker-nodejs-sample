import { z } from 'zod';

export const createTodoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
});

export const updateTodoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  completed: z.boolean().optional(),
});

export const todoIdSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoIdInput = z.infer<typeof todoIdSchema>;

// Validation functions for tests
export function validateTodoName(name: unknown): boolean {
  if (typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();
  return trimmed.length > 0;
}

export function validateTodoId(id: unknown): boolean {
  if (typeof id !== 'string') {
    return false;
  }

  const trimmed = id.trim();
  return trimmed.length > 0;
}
