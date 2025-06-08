'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

interface User {
  id: number;
  email: string;
  username: string;
  emailVerified: boolean;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface VerifyResponse {
  user: User;
  sessionId: string;
}

interface SessionInfo {
  id: string;
  device: string;
  lastActive: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  logout: () => Promise<void>;
  sessionId: string | null;
  hasSessionConflict: boolean;
  activeSessions: SessionInfo[];
  resolveSessionConflict: () => Promise<void>;
  dismissSessionConflict: () => void;
  refreshSessionInfo: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  sessionExpiry: number | null;
}

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSessionConflict, setHasSessionConflict] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const router = useRouter();

  const refreshSessionInfo = useCallback(async () => {
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Clear auth state on verification failure
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken, refreshToken, expiresIn } = response.data;

      // Store tokens in cookies
      const cookieOptions = [
        `path=/`,
        `max-age=${expiresIn}`,
        'SameSite=Lax',
        'Secure'
      ].join('; ');

      document.cookie = `token=${accessToken}; ${cookieOptions}`;
      document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
      document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; ${cookieOptions}`;

      return accessToken;
    } catch (error) {
      // Clear auth state on refresh failure
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    const tokenExpiry = document.cookie
      .split('; ')
      .find(row => row.startsWith('token_expiry='))
      ?.split('=')[1];

    if (token && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();
      const threshold = TOKEN_REFRESH_THRESHOLD;

      if (now + threshold >= expiryTime) {
        try {
          await refreshToken();
        } catch (error) {
          // Clear auth state on refresh failure
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await api.get('/auth/verify');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear auth state on verification failure
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, [refreshToken]);

  useEffect(() => {
    initializeAuth();

    // Set up token refresh interval
    const interval = setInterval(() => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const tokenExpiry = cookies['token-expiry'];
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();

        if (now >= expiryTime - TOKEN_REFRESH_THRESHOLD) {
          refreshToken();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [initializeAuth, refreshToken]);

  // Refresh session info periodically
  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(refreshSessionInfo, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId, refreshSessionInfo]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, expiresIn } = response.data;

      // Store tokens in cookies
      const cookieOptions = [
        `path=/`,
        `max-age=${expiresIn}`,
        'SameSite=Lax',
        'Secure'
      ].join('; ');

      document.cookie = `token=${accessToken}; ${cookieOptions}`;
      document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
      document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; ${cookieOptions}`;

      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear cookies regardless of server response
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    sessionId,
    hasSessionConflict,
    activeSessions,
    resolveSessionConflict: async () => {
      // Implementation for resolving session conflicts
    },
    dismissSessionConflict: () => {
      setHasSessionConflict(false);
    },
    refreshSessionInfo,
    refreshToken,
    setUser,
    sessionExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 