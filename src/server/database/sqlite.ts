import { TodoItem } from '@/shared/types/todo.js';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import sqlite3 from 'sqlite3';
import { DatabaseInterface } from './interface.js';

export class SqliteDatabase implements DatabaseInterface {
  private db: sqlite3.Database | null = null;
  private readonly location: string;

  constructor(location: string = process.env.SQLITE_DB_LOCATION || '/tmp/todo.db') {
    this.location = location;
  }

  async init(): Promise<void> {
    const dirName = dirname(this.location);
    
    try {
      await fs.access(dirName);
    } catch {
      await fs.mkdir(dirName, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.location, (err) => {
        if (err) return reject(err);

        if (process.env.NODE_ENV !== 'test') {
          console.log(`Using sqlite database at ${this.location}`);
        }

        this.db!.run(
          'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36) PRIMARY KEY, name varchar(255) NOT NULL, completed boolean NOT NULL DEFAULT 0)',
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    });
  }

  async teardown(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      this.db.all('SELECT * FROM todo_items ORDER BY name', (err, rows: any[]) => {
        if (err) return reject(err);
        
        const items = rows.map((item) => ({
          id: item.id,
          name: item.name,
          completed: item.completed === 1,
        }));
        
        resolve(items);
      });
    });
  }

  async getItem(id: string): Promise<TodoItem | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      this.db.get('SELECT * FROM todo_items WHERE id = ?', [id], (err, row: any) => {
        if (err) return reject(err);
        
        if (!row) return resolve(null);
        
        resolve({
          id: row.id,
          name: row.name,
          completed: row.completed === 1,
        });
      });
    });
  }

  async storeItem(item: TodoItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      this.db.run(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  async updateItem(id: string, updates: Partial<TodoItem>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const setParts: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        setParts.push('name = ?');
        values.push(updates.name);
      }

      if (updates.completed !== undefined) {
        setParts.push('completed = ?');
        values.push(updates.completed ? 1 : 0);
      }

      if (setParts.length === 0) {
        return resolve();
      }

      values.push(id);
      const sql = `UPDATE todo_items SET ${setParts.join(', ')} WHERE id = ?`;

      this.db.run(sql, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async removeItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      this.db.run('DELETE FROM todo_items WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
