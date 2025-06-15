import { AxiosError } from 'axios';

type ErrorContext = 'login' | 'fetchTapes' | 'fetchPublishers' | 'fetchBoxSets' | 'collection' | 'wantlist' | 'updateProfile' | 'resetPassword' | 'verifyEmail' | undefined;

export function getFriendlyErrorMessage(error: unknown, context?: ErrorContext): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const isNetworkError = !error.response;

    // Handle network errors first
    if (isNetworkError) {
      return 'Unable to reach the server. Please check your internet connection.';
    }

    // Handle specific status codes
    switch (status) {
      case 401:
        return context === 'login' 
          ? 'Incorrect email or password.'
          : 'You are not authorized to perform this action.';
      case 404:
        return 'Resource not found.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  // Handle native Error objects
  if (error instanceof Error) {
    // If it's already a user-friendly message, return it
    if (error.message.startsWith('Incorrect email or password') ||
        error.message.startsWith('You are not authorized') ||
        error.message.startsWith('Resource not found') ||
        error.message.startsWith('Invalid request') ||
        error.message.startsWith('Unable to reach the server') ||
        error.message.startsWith('Something went wrong')) {
      return error.message;
    }
  }

  // For any other type of error, return a generic message
  return 'Something went wrong. Please try again later.';
} 