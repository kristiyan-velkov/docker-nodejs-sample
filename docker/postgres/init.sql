-- Initialize PostgreSQL database for the Todo App
-- This script runs automatically when the container starts

-- Create the todos table
CREATE TABLE IF NOT EXISTS todo_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on completed status for faster queries
CREATE INDEX IF NOT EXISTS idx_todo_items_completed ON todo_items(completed);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_todo_items_created_at ON todo_items(created_at);

-- Insert some sample data for development
INSERT INTO todo_items (id, name, completed) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Learn TypeScript', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Build React components', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Set up Docker', false),
    ('550e8400-e29b-41d4-a716-446655440004', 'Deploy to production', false)
ON CONFLICT (id) DO NOTHING;
