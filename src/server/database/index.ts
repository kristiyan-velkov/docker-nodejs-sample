import { DatabaseInterface } from './interface.js';
import { PostgresDatabase } from './postgres.js';
import { SqliteDatabase } from './sqlite.js';

let db: DatabaseInterface;

if (process.env.POSTGRES_HOST) {
  db = new PostgresDatabase();
} else {
  db = new SqliteDatabase();
}

export { db };
