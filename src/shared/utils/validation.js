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
