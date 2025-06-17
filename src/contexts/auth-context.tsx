import type { User } from 'firebase/auth';
import { createContext, useContext } from 'react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isProUser: boolean; // Basic placeholder for subscription status
  trialDaysLeft: number | null; // Basic placeholder
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
