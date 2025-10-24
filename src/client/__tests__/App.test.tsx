import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

// Mock the useTodos hook
const mockUseTodos = {
  todos: [],
  loading: false,
  error: null,
  addTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  refreshTodos: vi.fn(),
};

vi.mock('../hooks/useTodos', () => ({
  useTodos: () => mockUseTodos,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockUseTodos.todos = [];
    mockUseTodos.loading = false;
    mockUseTodos.error = null;
  });

  it('renders app title and description', () => {
    render(<App />);

    expect(screen.getByText('Modern Todo App')).toBeInTheDocument();
    expect(screen.getByText(/Experience the future of task management/)).toBeInTheDocument();
  });

  it('renders technology badges', () => {
    render(<App />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React 19')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('renders AddTodoForm component', () => {
    render(<App />);

    expect(screen.getByPlaceholderText('What needs to be done? ✨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseTodos.loading = true;

    render(<App />);

    expect(screen.getByText('Loading your awesome todos...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    mockUseTodos.error = 'Failed to fetch todos';

    render(<App />);

    expect(screen.getByText('Failed to fetch todos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders TodoList when not loading and no error', () => {
    mockUseTodos.todos = [{ id: '1', name: 'Test Todo', completed: false }];

    render(<App />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('shows empty state when no todos', () => {
    mockUseTodos.todos = [];

    render(<App />);

    expect(screen.getByText('Ready to get organized?')).toBeInTheDocument();
  });

  it('renders footer with credits', () => {
    render(<App />);

    expect(screen.getByText(/Crafted with 💜 using cutting-edge technologies/)).toBeInTheDocument();
    expect(screen.getByText(/© 2025 Kristiyan Velkov/)).toBeInTheDocument();
  });

  it('handles multiple todos correctly', () => {
    const multipleTodos = [
      { id: '1', name: 'Todo 1', completed: false },
      { id: '2', name: 'Todo 2', completed: true },
      { id: '3', name: 'Todo 3', completed: false },
    ];
    mockUseTodos.todos = multipleTodos;

    render(<App />);

    multipleTodos.forEach((todo) => {
      expect(screen.getByText(todo.name)).toBeInTheDocument();
    });
  });

  it('does not show loading spinner when not loading', () => {
    mockUseTodos.loading = false;

    render(<App />);

    expect(screen.queryByText('Loading your awesome todos...')).not.toBeInTheDocument();
  });

  it('does not show error message when no error', () => {
    mockUseTodos.error = null;

    render(<App />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('shows todos section only when not loading and no error', () => {
    mockUseTodos.loading = false;
    mockUseTodos.error = null;
    mockUseTodos.todos = [{ id: '1', name: 'Test Todo', completed: false }];

    render(<App />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Loading your awesome todos...')).not.toBeInTheDocument();
  });

  it('has proper layout structure with animated background', () => {
    render(<App />);

    // Check for main container
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Check for header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
