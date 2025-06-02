'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  sessionId: string | null;
  hasSessionConflict: boolean;
  activeSessions: SessionInfo[];
  resolveSessionConflict: () => Promise<void>;
  dismissSessionConflict: () => void;
  refreshSessionInfo: () => Promise<void>;
}

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

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedSessionId = localStorage.getItem('session_id');

      if (!token || !storedSessionId) {
        setIsLoading(false);
        return;
      }

      // Verify session is still valid
      const response = await fetchApi<{ user: User; sessionId: string; sessions: SessionInfo[] }>('/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: storedSessionId }),
      });

      setUser(response.user);
      setSessionId(response.sessionId);
      setActiveSessions(response.sessions);
      localStorage.setItem('session_id', response.sessionId);

      // Check for session conflicts
      if (response.sessions.length > 1) {
        setHasSessionConflict(true);
      }
    } catch (error) {
      // If session verification fails, clear everything
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('session_id');
      setUser(null);
      setSessionId(null);
      setActiveSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Refresh session info periodically
  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(refreshSessionInfo, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId, refreshSessionInfo]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('token_expiry', String(Date.now() + response.expiresIn * 1000));
      localStorage.setItem('session_id', response.sessionId);

      setUser(response.user);
      setSessionId(response.sessionId);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'SESSION_CONFLICT') {
        setHasSessionConflict(true);
        // Fetch active sessions when conflict is detected
        await refreshSessionInfo();
      }
      throw error;
    }
  }, [router, refreshSessionInfo]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('session_id');
    setUser(null);
    setSessionId(null);
    setActiveSessions([]);
    router.push('/login');
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
      // Refresh session info after resolving conflict
      await refreshSessionInfo();
    } catch (error) {
      console.error('Failed to resolve session conflict:', error);
      // If we can't resolve the conflict, force logout
      logout();
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