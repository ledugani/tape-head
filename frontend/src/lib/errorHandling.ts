import { AxiosError } from 'axios';

export class UserFriendlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFriendlyError';
  }
}

export function formatApiError(error: unknown): Error {
  // If it's already a UserFriendlyError, return it as is
  if (error instanceof UserFriendlyError) {
    return error;
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Handle specific status codes
    switch (status) {
      case 401:
        return new UserFriendlyError(
          isLoginRequest 
            ? 'Incorrect email or password.'
            : 'You are not authorized to perform this action.'
        );
      case 404:
        return new UserFriendlyError('Resource not found.');
      case 400:
        return new UserFriendlyError('Invalid request. Please check your input and try again.');
      default:
        return new UserFriendlyError('Something went wrong. Please try again later.');
    }
  }

  // For any other type of error, return a generic message
  return new UserFriendlyError('Something went wrong. Please try again later.');
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.error || error.response?.data?.message || '';
    
    return (
      status === 401 ||
      status === 404 ||
      errorMsg.toLowerCase().includes('session expired') ||
      errorMsg.toLowerCase().includes('token expired') ||
      errorMsg.toLowerCase().includes('account not found') ||
      errorMsg.toLowerCase().includes('password incorrect')
    );
  }
  return false;
} 