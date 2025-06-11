'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button 
      data-testid="logout-button" 
      onClick={logout}
      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
    >
      Logout
    </button>
  );
} 