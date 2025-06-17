import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="absolute inset-0 opacity-50">
         {/* You can add a subtle background pattern or image here if desired */}
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Heart className="w-10 h-10" />
            <h1 className="text-4xl font-headline font-bold">Dostigram</h1>
          </Link>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-2xl">
          {children}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          New to Dostigram?{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
          <br />
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
