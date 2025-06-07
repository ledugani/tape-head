'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Initializing auth...');
      const token = Cookies.get('auth-token');
      console.log('AuthContext: Token from cookie:', token ? 'Token found' : 'No token found');
      const expiry = Cookies.get('auth-expiry');
      console.log('AuthContext: Expiry from cookie:', expiry ? `Expiry: ${expiry}` : 'No expiry found');
      const hasToken = !!token;
      const hasExpiry = !!expiry;
      console.log('AuthContext: Auth state:', { hasToken, hasExpiry });
      if (hasToken && hasExpiry) {
        const expiryTime = parseInt(expiry, 10);
        const now = Math.floor(Date.now() / 1000);
        console.log('AuthContext: Token expiry check:', { expiryTime, now, isValid: expiryTime > now });
        if (expiryTime > now) {
          console.log('AuthContext: Token is valid, setting auth state');
          setUser(null);
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          console.log('AuthContext: Token expired, clearing auth state');
          Cookies.remove('auth-token');
          Cookies.remove('auth-expiry');
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } else {
        console.log('AuthContext: No token or expiry found, clearing auth state');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
      console.log('AuthContext: Auth initialization complete, setting isLoading to false');
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    console.log('AuthContext: Login attempt with rememberMe:', rememberMe);
    const body = JSON.stringify({ email, password, rememberMe: !!rememberMe });
    console.log('AuthContext: Login request body:', body);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await response.json();
      console.log('AuthContext: Login response:', data);
      if (data.success) {
        console.log('AuthContext: Login successful, setting auth state');
        setUser({ id: '1', email });
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        console.log('AuthContext: Login failed:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logout attempt');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    Cookies.remove('auth-token');
    Cookies.remove('auth-expiry');
    console.log('AuthContext: Cookies removed, auth state cleared');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  console.log('Auth state changed:', { isAuthenticated, isLoading, user });

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