'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();
  
  console.log('LogoutButton rendered');
  
  return (
    <button 
      data-testid="logout-button" 
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
} 