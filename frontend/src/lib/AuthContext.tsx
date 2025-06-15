'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatApiError, UserFriendlyError } from './errorHandling';

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

// Add a helper for token debug logging
function debugToken(action: string, token?: string, expiry?: number) {
  console.debug(`[AuthContext] Token ${action}:`, {
    token: token ? `${token.slice(0, 10)}...` : undefined,
    expiry: expiry ? new Date(expiry).toISOString() : undefined,
    isValid: token && expiry ? expiry > Date.now() : false
  });
}

// Add fetchUserData function
const fetchUserData = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSessionConflict, setHasSessionConflict] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Watch for auth state changes
  useEffect(() => {
    console.debug('[AuthContext] Auth state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const getCookie = useCallback((name: string) => {
    if (typeof document === 'undefined') return null;
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
  }, []);

  const setCookie = useCallback((name: string, value: string, options: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${value}; ${options}`;
  }, []);

  const clearCookie = useCallback((name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }, []);

  const refreshSessionInfo = useCallback(async () => {
    if (!mounted) return;
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      clearCookie('token');
      clearCookie('refresh_token');
      clearCookie('token_expiry');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [mounted, clearCookie]);

  const refreshToken = useCallback(async () => {
    if (!mounted) return;
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken, refreshToken, expiresIn } = response.data;

      const cookieOptions = [
        `path=/`,
        `max-age=${expiresIn}`,
        'SameSite=Lax',
        'Secure'
      ].join('; ');

      setCookie('token', accessToken, cookieOptions);
      setCookie('refresh_token', refreshToken, cookieOptions);
      setCookie('token_expiry', String(Date.now() + expiresIn * 1000), cookieOptions);

      return accessToken;
    } catch (error) {
      clearCookie('token');
      clearCookie('refresh_token');
      clearCookie('token_expiry');
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  }, [mounted, setCookie, clearCookie]);

  const initializeAuth = useCallback(async () => {
    if (!mounted) return;
    const token = getCookie('token');
    const tokenExpiry = getCookie('token_expiry');

    if (token && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();
      const threshold = TOKEN_REFRESH_THRESHOLD;

      if (now + threshold >= expiryTime) {
        try {
          await refreshToken();
        } catch (error) {
          clearCookie('token');
          clearCookie('refresh_token');
          clearCookie('token_expiry');
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
        clearCookie('token');
        clearCookie('refresh_token');
        clearCookie('token_expiry');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, [mounted, getCookie, refreshToken, clearCookie]);

  useEffect(() => {
    if (mounted) {
      initializeAuth();
    }
  }, [mounted, initializeAuth]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const tokenExpiry = getCookie('token_expiry');
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();

        if (now >= expiryTime - TOKEN_REFRESH_THRESHOLD) {
          refreshToken();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [mounted, getCookie, refreshToken]);

  useEffect(() => {
    if (!mounted || !sessionId) return;

    const interval = setInterval(refreshSessionInfo, 30000);
    return () => clearInterval(interval);
  }, [mounted, sessionId, refreshSessionInfo]);

  // Token management helpers
  const getToken = useCallback(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['token'];
    const expiry = cookies['token_expiry'] ? parseInt(cookies['token_expiry'], 10) : undefined;
    
    debugToken('checked', token, expiry);
    
    if (!token || !expiry || expiry <= Date.now()) {
      debugToken('invalid', token, expiry);
      return null;
    }
    
    return token;
  }, []);

  const setToken = useCallback((token: string, expiresIn: number) => {
    const expiry = Date.now() + expiresIn * 1000;
    debugToken('set', token, expiry);
    
    document.cookie = `token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax; Secure`;
    document.cookie = `token_expiry=${expiry}; path=/; max-age=${expiresIn}; SameSite=Lax; Secure`;
  }, []);

  const removeToken = useCallback(() => {
    debugToken('removed');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
    document.cookie = 'token_expiry=; path=/; max-age=0; SameSite=Lax; Secure';
  }, []);

  // Check auth state on mount and cookie changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        console.debug('[AuthContext] No valid token found, clearing auth state');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userData = await fetchUserData();
        console.debug('[AuthContext] Valid token, user data fetched:', userData);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.debug('[AuthContext] Token validation failed:', error);
        removeToken();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getToken, removeToken]);

  // Watch for auth state changes
  useEffect(() => {
    console.debug('[AuthContext] Auth state changed:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null,
      isLoading
    });
  }, [isAuthenticated, user, isLoading]);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<User> => {
    console.debug('[AuthContext] Login attempt:', { email, rememberMe });
    if (!mounted) throw new UserFriendlyError('Not mounted');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, expiresIn, user: userData } = response.data;
      
      setToken(accessToken, expiresIn);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.debug('[AuthContext] Login successful:', {
        user: { id: userData.id, email: userData.email },
        expiresIn
      });
      
      return userData;
    } catch (error) {
      console.debug('[AuthContext] Login failed:', error);
      
      // Clear any existing auth state
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
      
      // Format the error with user-friendly message
      throw formatApiError(error);
    }
  };

  const logout = async () => {
    console.debug('[AuthContext] Logout attempt');
    if (!mounted) return;
    
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.debug('[AuthContext] Logout API call failed:', error);
    } finally {
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
      console.debug('[AuthContext] Logout completed');
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