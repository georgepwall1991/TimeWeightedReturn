import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <TrendingUp className="w-16 h-16 text-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Portfolio Analytics
        </h2>
        <p className="text-sm text-gray-500">Loading...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};
