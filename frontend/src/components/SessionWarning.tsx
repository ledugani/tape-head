'use client';

interface SessionWarningProps {
  message: string;
  onConfirm: () => Promise<void>;
  onDismiss: () => void;
}

export function SessionWarning({ message, onConfirm, onDismiss }: SessionWarningProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="text-gray-900 mb-4">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Dismiss
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Log Out Other Sessions
        </button>
      </div>
    </div>
  );
} 