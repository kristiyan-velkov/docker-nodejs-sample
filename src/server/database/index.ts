import { DatabaseInterface } from './interface.js';
import { PostgresDatabase } from './postgres.js';

const db: DatabaseInterface = new PostgresDatabase();

export { db };
