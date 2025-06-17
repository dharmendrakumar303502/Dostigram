'use client';

import type { ReactNode } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import useFirebaseAuth from '@/hooks/useFirebaseAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading, isProUser, trialDaysLeft, userProfile } = useFirebaseAuth();
  
  const value = {
    user,
    loading,
    isProUser,
    trialDaysLeft,
    userProfile, // Add userProfile to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
