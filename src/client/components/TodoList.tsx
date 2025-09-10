import { TodoItem as TodoType } from '@/shared/types/todo';
import React, { useMemo } from 'react';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: TodoType[];
  onUpdate: (id: string, updates: Partial<TodoType>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, onDelete }) => {
  const { completedTodos, incompleteTodos } = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed);
    const incomplete = todos.filter((todo) => !todo.completed);

    return {
      completedTodos: completed,
      incompleteTodos: incomplete,
    };
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 glass rounded-full flex items-center justify-center">
          <span className="text-4xl">🌟</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to get organized?</h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Start your productivity journey by adding your first todo above. Every great
          accomplishment starts with a single step!
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <span>✨</span>
          <span>Your todos will appear here magically</span>
          <span>✨</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {incompleteTodos.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">Active Tasks</h3>
            <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {incompleteTodos.length}
            </span>
          </div>
          <div className="space-y-3">
            {incompleteTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}

      {completedTodos.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">Completed Tasks</h3>
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {completedTodos.length}
            </span>
          </div>
          <div className="space-y-3">
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}

      <div className="glass p-6 rounded-2xl">
        <div className="flex justify-between items-center text-white/80">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-black">Total: {todos.length} items</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-black">Active: {incompleteTodos.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-black">Completed: {completedTodos.length}</span>
            </div>
          </div>
        </div>

        {todos.length > 0 && (
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedTodos.length / todos.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-black text-sm mt-2 text-center">
              {Math.round((completedTodos.length / todos.length) * 100)}% Complete
              {completedTodos.length === todos.length && ' 🎉'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
