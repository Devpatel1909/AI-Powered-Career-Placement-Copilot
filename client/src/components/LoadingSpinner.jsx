import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'AI Model Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-400 font-mono animate-pulse">{message}</p>
    </div>
  );
}
