export interface TodoItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface CreateTodoRequest {
  name: string;
}

export interface UpdateTodoRequest {
  name?: string;
  completed?: boolean;
}

export interface DatabaseConfig {
  type: 'postgres';
  connection: PostgresConfig;
}

export interface PostgresConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}
