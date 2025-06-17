import { Heart } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
      <Heart className="w-24 h-24 text-primary mb-6 opacity-50" />
      <h2 className="text-2xl font-headline font-semibold text-foreground mb-2">
        Welcome to Dostigram Chat
      </h2>
      <p className="text-muted-foreground max-w-md">
        Select a friend from the sidebar to start a conversation. Your messages will appear here.
        Happy chatting!
      </p>
    </div>
  );
}
