
import React from 'react';

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent border-solid rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>}
    </div>
  );
};
