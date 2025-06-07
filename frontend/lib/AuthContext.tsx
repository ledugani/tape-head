'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  hasSessionConflict: boolean;
  resolveSessionConflict: () => void;
  dismissSessionConflict: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSessionConflict, setHasSessionConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading, user });
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    console.log('DEBUG: AuthContext loaded');
    const initializeAuth = () => {
      try {
        // Check if localStorage is available
        if (typeof window === 'undefined' || !window.localStorage) {
          console.warn('localStorage is not available. Proceeding with empty state.');
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('access_token');
        const tokenExpiry = localStorage.getItem('token_expiry');
        const userEmail = localStorage.getItem('user_email');

        console.log('DEBUG: Initializing auth with:', { token, tokenExpiry, userEmail });

        if (token && tokenExpiry && parseInt(tokenExpiry) > Date.now()) {
          console.log('DEBUG: Valid token found, setting authenticated state');
          setIsAuthenticated(true);
          if (userEmail) {
            console.log('DEBUG: Setting user with email:', userEmail);
            setUser({ email: userEmail });
          }
        } else {
          console.log('DEBUG: No valid token found, clearing auth state');
          clearAuthState();
        }
        setIsLoading(false);
      } catch (err) {
        console.error('ERROR in initializeAuth:', err);
        setError('Failed to initialize authentication context.');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    console.log('[AuthContext] useEffect: isLoading', isLoading, 'user', user);
  }, [isLoading, user]);

  const setAuthState = (
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
    email: string
  ) => {
    console.log('DEBUG: Setting auth state with email:', email);
    const expiryTime = Date.now() + tokens.expiresIn * 1000;
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('token_expiry', expiryTime.toString());
    localStorage.setItem('user_email', email);
    
    // Set both states together to avoid race conditions
    const newUser = { email };
    console.log('DEBUG: Setting user state:', newUser);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const clearAuthState = () => {
    console.log('DEBUG: Clearing auth state');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_email');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    console.log('[AuthContext] login called', { email, password, rememberMe });
    try {
      console.log('DEBUG: login called with rememberMe:', rememberMe);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();
      console.log('DEBUG: login response:', data);

      if (data.success) {
        console.log('DEBUG: login successful, calling setAuthState');
        setAuthState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        }, data.user.email);
        console.log('[AuthContext] login success, user set:', data.user.email);
        console.log('DEBUG: before router.push');
        router.push(data.redirect || '/dashboard');
        console.log('DEBUG: after router.push');
      } else {
        console.error('DEBUG: login failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('DEBUG: login error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthState();
    router.push('/login');
  };

  const resolveSessionConflict = () => {
    setHasSessionConflict(false);
  };

  const dismissSessionConflict = () => {
    setHasSessionConflict(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        hasSessionConflict,
        resolveSessionConflict,
        dismissSessionConflict,
        login,
        logout,
      }}
    >
      {error ? (
        <div style={{ color: 'red', padding: 16 }}>AuthProvider Error: {error}</div>
      ) : (
        children
      )}
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