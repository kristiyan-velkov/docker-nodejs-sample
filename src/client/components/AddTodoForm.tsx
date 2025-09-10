import React, { useState } from 'react';

interface AddTodoFormProps {
  onAdd: (name: string) => Promise<void>;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Todo name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onAdd(name.trim());
      setName('');
    } catch (error) {
      console.error('Failed to add todo:', error);
      setError(error instanceof Error ? error.message : 'Failed to add todo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">Add New Todo</h2>
        </div>

        <div className="flex gap-3">
          <input
            id="todoName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="What needs to be done? ✨"
            className="input flex-grow text-base"
            disabled={isLoading}
            maxLength={255}
          />
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="btn btn-primary whitespace-nowrap min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="spinner" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Add Todo</span>
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Press Enter to quickly add, or click the button</span>
        </div>
      </div>
    </form>
  );
};
