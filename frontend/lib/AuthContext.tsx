'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchApi, ApiError } from './api';

interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  sessionTimeout: number | null;
  resetSessionTimeout: () => void;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const resetSessionTimeout = useCallback(() => {
    if (user) {
      const timeout = Date.now() + SESSION_TIMEOUT;
      setSessionTimeout(timeout);
      setTimeoutWarning(false);
    }
  }, [user]);

  const handleSessionTimeout = useCallback(() => {
    if (sessionTimeout && Date.now() >= sessionTimeout) {
      logout();
    } else if (sessionTimeout && !timeoutWarning && Date.now() >= sessionTimeout - SESSION_WARNING_TIME) {
      setTimeoutWarning(true);
      // Show warning to user
      if (window.confirm('Your session will expire in 5 minutes. Would you like to stay signed in?')) {
        resetSessionTimeout();
      }
    }
  }, [sessionTimeout, timeoutWarning, resetSessionTimeout]);

  useEffect(() => {
    if (user) {
      resetSessionTimeout();
      const interval = setInterval(handleSessionTimeout, 1000);
      return () => clearInterval(interval);
    }
  }, [user, handleSessionTimeout, resetSessionTimeout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (token && refreshToken) {
        try {
          // Verify token and get user info
          const response = await fetchApi<{ user: User }>('/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.user);
          resetSessionTimeout();
        } catch (error) {
          if (error instanceof ApiError && error.code === 'TOKEN_EXPIRED') {
            // Show session expired message
            alert('Your session has expired. Please sign in again.');
          }
          // If token is invalid, clear all tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [resetSessionTimeout]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store tokens
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('token_expiry', String(Date.now() + response.expiresIn * 1000));
      
      // Update user state
      setUser(response.user);
      resetSessionTimeout();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    setUser(null);
    setSessionTimeout(null);
    setTimeoutWarning(false);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    sessionTimeout,
    resetSessionTimeout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 