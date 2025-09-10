import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-purple-300 rounded-full animate-spin animation-delay-150"></div>
        <div className="absolute top-4 left-4 w-8 h-8 border-4 border-transparent border-t-pink-300 rounded-full animate-spin animation-delay-300"></div>
      </div>
      <p className="text-white/80 text-lg font-medium">{message}</p>
      <div className="flex gap-1 mt-3">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-100"></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
      </div>

      <style jsx>{`
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};
