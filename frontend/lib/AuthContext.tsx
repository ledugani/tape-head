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
      document.cookie = `token=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Strict`;
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${expiresIn * 2}; SameSite=Strict`;
      document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; path=/; max-age=${expiresIn}; SameSite=Strict`;
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

      const token = cookies['token'];
      const tokenExpiry = cookies['token_expiry'];

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
        }
      } else {
        console.log('No token found, clearing auth state');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // If token verification fails, clear everything
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      setIsAuthenticated(false);
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

      const tokenExpiry = cookies['token_expiry'];
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
        'Secure',        // Added Secure flag
      ].filter(Boolean).join('; ');

      document.cookie = `token=${token}; ${cookieOptions}`;
      document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
      document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; ${cookieOptions}`;

      // Update auth state before returning
      setUser(user);
      setIsAuthenticated(true);
      
      // Wait a moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const resolveSessionConflict = useCallback(async () => {
    try {
      await api.post('/auth/logout-other-sessions', { sessionId });
      setHasSessionConflict(false);
      await refreshSessionInfo();
    } catch (error) {
      console.error('Failed to resolve session conflict:', error);
      await logout();
    }
  }, [sessionId, logout, refreshSessionInfo]);

  const dismissSessionConflict = useCallback(() => {
    setHasSessionConflict(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    sessionId,
    hasSessionConflict,
    activeSessions,
    resolveSessionConflict,
    dismissSessionConflict,
    refreshSessionInfo,
    refreshToken,
    setUser,
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