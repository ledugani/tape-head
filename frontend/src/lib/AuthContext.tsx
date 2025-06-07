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
    if (!sessionId) return;

    try {
      const response = await api.get('/auth/sessions');
      setActiveSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  }, [sessionId]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken, refreshToken, expiresIn } = response.data;
      
      // Set cookies
      document.cookie = `auth-token=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`;
      document.cookie = `refresh-token=${refreshToken}; path=/; max-age=${expiresIn * 2}; SameSite=Lax`;
      document.cookie = `token-expiry=${Date.now() + expiresIn * 1000}; path=/; max-age=${expiresIn}; SameSite=Lax`;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      
      // Check for token in cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const token = cookies['auth-token'];
      const tokenExpiry = cookies['token-expiry'];

      console.log('Auth state:', { hasToken: !!token, hasExpiry: !!tokenExpiry });

      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();

        console.log('Token expiry check:', { expiryTime, now, threshold: TOKEN_REFRESH_THRESHOLD });

        // If token is expired or about to expire, try to refresh it
        if (now >= expiryTime - TOKEN_REFRESH_THRESHOLD) {
          console.log('Token needs refresh, attempting refresh...');
          await refreshToken();
        }

        // Verify token and get user info
        console.log('Verifying token...');
        const response = await api.get('/auth/verify');
        console.log('Verify response:', response.data);
        
        if (response.data.user) {
          console.log('Setting user in context from verify:', response.data.user);
          setUser(response.data.user);
          setIsAuthenticated(true);
          setSessionExpiry(Date.now() + 60 * 60 * 1000);
        }
      } else {
        console.log('No token found, clearing auth state');
        setUser(null);
        setIsAuthenticated(false);
        setSessionExpiry(null);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // If token verification fails, clear everything
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token-expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpiry(null);
    } finally {
      console.log('Auth initialization complete, setting isLoading to false');
      setIsLoading(false);
    }
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

  // Add effect to log auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading, user });
  }, [user, isLoading, isAuthenticated]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken, expiresIn } = response.data;

      // Set cookies with secure attributes
      const maxAge = rememberMe ? expiresIn : undefined;
      const cookieOptions = [
        `path=/`,
        maxAge ? `max-age=${maxAge}` : '',
        'SameSite=Lax',  // Changed from Strict to Lax for better compatibility
        'HttpOnly',
      ].filter(Boolean).join('; ');

      // Set the auth token
      document.cookie = `auth-token=${token}; ${cookieOptions}`;
      
      // Set the refresh token if provided
      if (refreshToken) {
        document.cookie = `refresh-token=${refreshToken}; ${cookieOptions}`;
      }

      // Set token expiry
      const expiryTime = Date.now() + expiresIn * 1000;
      document.cookie = `token-expiry=${expiryTime}; ${cookieOptions}`;

      setUser(user);
      setIsAuthenticated(true);
      setSessionExpiry(expiryTime);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear cookies
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token-expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpiry(null);
      setSessionId(null);
      setHasSessionConflict(false);
      setActiveSessions([]);
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