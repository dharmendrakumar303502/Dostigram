
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t mt-auto">
      © {new Date().getFullYear()} Dostigram — Created with ❤️ by Dharmendra Kumar Meena
    </footer>
  );
}
