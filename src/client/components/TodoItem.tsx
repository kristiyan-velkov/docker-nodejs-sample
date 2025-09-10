import { TodoItem as TodoType } from '@/shared/types/todo';
import React, { useState } from 'react';

interface TodoItemProps {
  todo: TodoType;
  onUpdate: (id: string, updates: Partial<TodoType>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todo.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    try {
      setIsLoading(true);
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editName.trim() === todo.name || editName.trim() === '') {
      setIsEditing(false);
      setEditName(todo.name);
      return;
    }

    try {
      setIsLoading(true);
      await onUpdate(todo.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      setEditName(todo.name);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(todo.name);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        setIsLoading(true);
        await onDelete(todo.id);
      } catch (error) {
        console.error('Failed to delete todo:', error);
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`todo-item flex items-center gap-4 ${isLoading ? 'pulse opacity-75' : ''}`}>
      <button
        onClick={handleToggleComplete}
        disabled={isLoading}
        className={`checkbox ${todo.completed ? 'checked' : ''}`}
      >
        {todo.completed && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <div className="flex-grow min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            className="input w-full"
            autoFocus
            disabled={isLoading}
            placeholder="Enter todo name..."
          />
        ) : (
          <div
            className={`cursor-pointer transition-all duration-300 ${
              todo.completed
                ? 'text-gray-500 line-through opacity-70'
                : 'text-gray-800 hover:text-gray-900'
            }`}
            onClick={() => !isLoading && setIsEditing(true)}
          >
            <span className="text-base font-medium">{todo.name}</span>
            {todo.completed && (
              <span className="ml-2 text-xs text-green-600 font-semibold">✓ Completed</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {isLoading && <div className="spinner mr-2" />}

        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="btn btn-primary btn-sm"
              title="Save changes"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
              title="Cancel editing"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
              title="Edit todo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="btn btn-danger btn-sm"
              title="Delete todo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
