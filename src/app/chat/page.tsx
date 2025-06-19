'use client';

import { Heart } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
      <Heart className="w-24 h-24 text-primary mb-6 opacity-50" />
      <h1 className="text-3xl font-bold text-foreground mb-2">Chat Page Simplified</h1>
      <p className="text-muted-foreground">
        If you see this, the basic chat page route is working.
      </p>
    </div>
  );
}
