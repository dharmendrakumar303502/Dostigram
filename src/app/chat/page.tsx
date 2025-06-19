
'use client';

import { Heart } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login'); 
    }
  }, [user, loading, router]);

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your chat experience...</p>
      </div>
    );
  }

  if (!user && !loading) {
     // This case should ideally be caught by the useEffect redirect or layout guard
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <p className="text-lg text-destructive">Access denied. Please log in.</p>
      </div>
     );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
      <Heart className="w-24 h-24 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold text-foreground font-headline mb-4">
        Welcome to Dostigram Chat
      </h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Select a friend from the sidebar to start a conversation, or search for users to chat with. Let the good times roll!
      </p>
    </div>
  );
}

    