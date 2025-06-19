
'use client';
// Removed Heart icon import for ultra-simplicity

export default function ChatPage() {
  // console.log("Rendering ChatPage (ultra-simplified)");
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4" style={{ color: 'green' }}>
        ULTRA-SIMPLIFIED CHAT PAGE
      </h1>
      <p className="text-muted-foreground text-lg">
        If you see this, the basic ChatPage component for /chat is rendering correctly.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Navigating to /chat after login should show this page.
      </p>
    </div>
  );
}
