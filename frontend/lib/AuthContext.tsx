'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from './api';

interface User {
  id: string;
  email: string;
  name: string;
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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  sessionId: string | null;
  hasSessionConflict: boolean;
  activeSessions: SessionInfo[];
  resolveSessionConflict: () => Promise<void>;
  dismissSessionConflict: () => void;
  refreshSessionInfo: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSessionConflict, setHasSessionConflict] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const router = useRouter();

  const refreshSessionInfo = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetchApi<{ sessions: SessionInfo[] }>('/auth/sessions', {
        method: 'GET',
      });
      setActiveSessions(response.sessions);
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  }, [sessionId]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetchApi<AuthResponse>('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('token_expiry', String(Date.now() + response.expiresIn * 1000));
      
      setUser(response.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout the user
      await logout();
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const tokenExpiry = localStorage.getItem('token_expiry');
      
      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        // If token is expired or about to expire, try to refresh it
        if (now >= expiryTime - TOKEN_REFRESH_THRESHOLD) {
          await refreshToken();
        } else {
          // Verify token and get user info
          const response = await fetchApi<VerifyResponse>('/auth/verify', {
            method: 'GET',
          });
          setUser(response.user);
          setSessionId(response.sessionId);
        }
      }
    } catch (error) {
      // If token verification fails, clear everything
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      setUser(null);
      setSessionId(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up token refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem('token_expiry');
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        if (now >= expiryTime - TOKEN_REFRESH_THRESHOLD) {
          refreshToken();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [refreshToken]);

  // Refresh session info periodically
  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(refreshSessionInfo, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId, refreshSessionInfo]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const sessionDuration = rememberMe ? REMEMBER_ME_DURATION : DEFAULT_SESSION_DURATION;
      
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('token_expiry', String(Date.now() + sessionDuration));
      localStorage.setItem('session_id', response.sessionId);

      setUser(response.user);
      setSessionId(response.sessionId);
      
      // If email is not verified, redirect to verification page
      if (!response.user.emailVerified) {
        router.push('/verify-email');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.code === 'SESSION_CONFLICT') {
        setHasSessionConflict(true);
        await refreshSessionInfo();
      }
      throw error;
    }
  }, [router, refreshSessionInfo]);

  const logout = useCallback(async () => {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('session_id');
      setUser(null);
      setSessionId(null);
      setActiveSessions([]);
      router.push('/login');
    }
  }, [router]);

  const resolveSessionConflict = useCallback(async () => {
    try {
      await fetchApi('/auth/logout-other-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
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
    isAuthenticated: !!user,
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