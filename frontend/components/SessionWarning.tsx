'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface SessionWarningProps {
  message: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function SessionWarning({ message, onConfirm, onDismiss }: SessionWarningProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const { logout } = useAuth();

  if (!isVisible) return null;

  const handleConfirm = async () => {
    try {
      setIsResolving(true);
      await onConfirm();
    } catch (error) {
      console.error('Failed to resolve session conflict:', error);
      // If resolution fails, show error and keep warning visible
      setIsResolving(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex flex-col">
            <span className="font-medium">{message}</span>
            <span className="text-sm opacity-75">
              This will log you out of all other devices and browsers.
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDismiss}
            disabled={isResolving}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep All Sessions
          </button>
          <button
            onClick={handleConfirm}
            disabled={isResolving}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResolving ? 'Logging Out Other Sessions...' : 'Logout Other Sessions'}
          </button>
        </div>
      </div>
    </div>
  );
} 