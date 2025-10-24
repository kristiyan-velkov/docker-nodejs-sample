import { promises as fs } from 'fs';
import { Client } from 'pg';
import waitPort from 'wait-port';
import { TodoItem } from '../../shared/types/todo.js';
import { DatabaseInterface } from './interface.js';

export class PostgresDatabase implements DatabaseInterface {
  private client: Client | null = null;

  async init(): Promise<void> {
    const config = await this.getConfig();

    console.log(`Waiting for PostgreSQL at ${config.host}:${config.port || 5432}...`);

    const portOpen = await waitPort({
      host: config.host,
      port: config.port || 5432,
      timeout: 30000,
      waitForDns: true,
    });

    if (!portOpen) {
      throw new Error(
        `Unable to connect to PostgreSQL at ${config.host}:${config.port || 5432}. Make sure the database is running.`
      );
    }

    console.log('PostgreSQL is ready, connecting...');

    this.client = new Client(config);

    try {
      await this.client.connect();
      console.log(`Connected to postgres db at host ${config.host}`);

      await this.client.query(`
        CREATE TABLE IF NOT EXISTS todo_items (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);

      console.log('Connected to db and created table todo_items if it did not exist');
    } catch (err) {
      console.error('Unable to connect to the database:', err);
      throw err;
    }
  }

  async teardown(): Promise<void> {
    if (this.client) {
      try {
        await this.client.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
        throw err;
      }
    }
  }

  async getItems(): Promise<TodoItem[]> {
    if (!this.client) throw new Error('Database not initialized');

    try {
      const result = await this.client.query('SELECT * FROM todo_items ORDER BY name');
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        completed: row.completed,
      }));
    } catch (err) {
      console.error('Unable to get items:', err);
      throw err;
    }
  }

  async getItem(id: string): Promise<TodoItem | null> {
    if (!this.client) throw new Error('Database not initialized');

    try {
      const result = await this.client.query('SELECT * FROM todo_items WHERE id = $1', [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        completed: row.completed,
      };
    } catch (err) {
      console.error('Unable to get item:', err);
      throw err;
    }
  }

  async storeItem(item: TodoItem): Promise<void> {
    if (!this.client) throw new Error('Database not initialized');

    try {
      await this.client.query('INSERT INTO todo_items(id, name, completed) VALUES($1, $2, $3)', [
        item.id,
        item.name,
        item.completed,
      ]);
      console.log('Stored item:', item);
    } catch (err) {
      console.error('Unable to store item:', err);
      throw err;
    }
  }

  async updateItem(id: string, updates: Partial<TodoItem>): Promise<void> {
    if (!this.client) throw new Error('Database not initialized');

    const setParts: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.completed !== undefined) {
      setParts.push(`completed = $${paramIndex++}`);
      values.push(updates.completed);
    }

    if (setParts.length === 0) return;

    values.push(id);
    const sql = `UPDATE todo_items SET ${setParts.join(', ')} WHERE id = $${paramIndex}`;

    try {
      await this.client.query(sql, values);
      console.log('Updated item:', { id, updates });
    } catch (err) {
      console.error('Unable to update item:', err);
      throw err;
    }
  }

  async removeItem(id: string): Promise<void> {
    if (!this.client) throw new Error('Database not initialized');

    try {
      await this.client.query('DELETE FROM todo_items WHERE id = $1', [id]);
      console.log('Removed item:', id);
    } catch (err) {
      console.error('Unable to remove item:', err);
      throw err;
    }
  }

  private async getConfig() {
    const {
      POSTGRES_HOST: HOST,
      POSTGRES_HOST_FILE: HOST_FILE,
      POSTGRES_USER: USER,
      POSTGRES_USER_FILE: USER_FILE,
      POSTGRES_PASSWORD: PASSWORD,
      POSTGRES_PASSWORD_FILE: PASSWORD_FILE,
      POSTGRES_DB: DB,
      POSTGRES_DB_FILE: DB_FILE,
    } = process.env;

    const host = HOST_FILE ? (await fs.readFile(HOST_FILE, 'utf8')).trim() : HOST;
    const user = USER_FILE ? (await fs.readFile(USER_FILE, 'utf8')).trim() : USER;
    const password = PASSWORD_FILE ? (await fs.readFile(PASSWORD_FILE, 'utf8')).trim() : PASSWORD;
    const database = DB_FILE ? (await fs.readFile(DB_FILE, 'utf8')).trim() : DB;

    if (!host || !user || !password || !database) {
      throw new Error('Missing required PostgreSQL configuration');
    }

    return { host, user, password, database, port: 5432 };
  }
}
