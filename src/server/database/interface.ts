import { TodoItem } from '../../shared/types/todo.js';

export interface DatabaseInterface {
  init(): Promise<void>;
  teardown(): Promise<void>;
  getItems(): Promise<TodoItem[]>;
  getItem(id: string): Promise<TodoItem | null>;
  storeItem(item: TodoItem): Promise<void>;
  updateItem(id: string, item: Partial<TodoItem>): Promise<void>;
  removeItem(id: string): Promise<void>;
}
