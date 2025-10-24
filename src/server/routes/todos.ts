import { NextFunction, Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem } from '../../shared/types/todo.js';
import { createTodoSchema, todoIdSchema, updateTodoSchema } from '../../shared/utils/validation.js';
import { db } from '../database/index.js';
import { validateBody, validateParams } from '../middleware/validation.js';

const router = Router();

// GET /api/todos - Get all todos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db.getItems();
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/todos/:id - Get single todo
router.get(
  '/:id',
  validateParams(todoIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await db.getItem(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/todos - Create new todo
router.post(
  '/',
  validateBody(createTodoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newTodo: TodoItem = {
        id: uuidv4(),
        name: req.body.name,
        completed: false,
      };

      await db.storeItem(newTodo);

      res.status(201).json({
        success: true,
        data: newTodo,
        message: 'Todo created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/todos/:id - Update todo
router.put(
  '/:id',
  validateParams(todoIdSchema),
  validateBody(updateTodoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Check if todo exists
      const existingTodo = await db.getItem(id);
      if (!existingTodo) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      // Update the todo
      await db.updateItem(id, req.body);

      // Get updated todo
      const updatedTodo = await db.getItem(id);

      res.json({
        success: true,
        data: updatedTodo,
        message: 'Todo updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/todos/:id - Delete todo
router.delete(
  '/:id',
  validateParams(todoIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Check if todo exists
      const existingTodo = await db.getItem(id);
      if (!existingTodo) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      await db.removeItem(id);

      res.json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
