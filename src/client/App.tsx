import React from 'react';
import { AddTodoForm } from './components/AddTodoForm';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TodoList } from './components/TodoList';
import { useTodos } from './hooks/useTodos';

const App: React.FC = () => {
  const { todos, loading, error, addTodo, updateTodo, deleteTodo, refreshTodos } = useTodos();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-5xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl mb-4 shadow-xl">
            <span className="text-2xl">✨</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Modern Todo App</h1>
          <p className="text-white/80 text-base mb-4 max-w-xl mx-auto">
            Experience the future of task management with our sleek, TypeScript-powered application
          </p>

          <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-white/90 text-xs font-medium">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
            <span>TypeScript</span>
            <span className="text-white/50">•</span>
            <span>React 19</span>
            <span className="text-white/50">•</span>
            <span>Tailwind CSS</span>
            <span className="text-white/50">•</span>
            <span>Docker</span>
          </div>
        </header>

        <main className="space-y-6">
          <div className="card p-6">
            <AddTodoForm onAdd={addTodo} />
          </div>

          {loading && (
            <div className="card p-8">
              <LoadingSpinner message="Loading your awesome todos..." />
            </div>
          )}

          {error && !loading && (
            <div className="card p-6">
              <ErrorMessage error={error} onRetry={refreshTodos} />
            </div>
          )}

          {!loading && !error && (
            <div className="card p-6">
              <TodoList todos={todos} onUpdate={updateTodo} onDelete={deleteTodo} />
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-white/60 text-xs">
          <div className="glass px-4 py-3 rounded-xl inline-block">
            <p className="mb-1">Crafted with 💜 using cutting-edge technologies</p>
            <p>© 2025 Kristiyan Velkov • Built for the future</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
