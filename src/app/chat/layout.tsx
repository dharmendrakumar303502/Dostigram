
'use client';
import type { ReactNode } from 'react';

// Removed all AuthContext and Firebase related imports and logic for now

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  // console.log("Rendering ChatLayout (ultra-simplified)");

  // No auth check for now, just render children
  return (
    <div style={{ border: '5px solid red', padding: '20px', margin: '10px', flexGrow: 1, backgroundColor: '#ffebee' }}>
      <h1 style={{ textAlign: 'center', color: 'red', fontSize: '2em', fontWeight: 'bold' }}>
        ULTRA-SIMPLIFIED CHAT LAYOUT
      </h1>
      <p style={{ textAlign: 'center', marginTop: '10px', color: '#d32f2f' }}>
        If you see this, the basic ChatLayout component is rendering.
        The next step is to check Vercel environment variables for Firebase if this works.
      </p>
      <div style={{ border: '2px solid orange', padding: '15px', marginTop: '20px', backgroundColor: '#fff3e0' }}>
        {children}
      </div>
    </div>
  );
}
