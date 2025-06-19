'use client';

import type { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link'; // Added for testing navigation

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading: authLoading } = useAuthContext();

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading auth...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>
          Please <Link href="/auth/login" className="underline text-primary">log in</Link> to access chat. (Simplified Layout)
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: '3px dashed green', padding: '20px', margin: '10px', flexGrow: 1 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Simplified Chat Layout Shell</h2>
      <p style={{ textAlign: 'center', marginBottom: '10px' }}>Current User: {user.email}</p>
      <div style={{ border: '1px solid blue', padding: '10px' }}>
        {children}
      </div>
    </div>
  );
}
