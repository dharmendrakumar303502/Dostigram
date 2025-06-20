
'use client';

import Link from 'next/link';
import { Heart, UserCircle, LogIn, LogOut, UserPlus, Crown, Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Header() {
  const { user, loading, userProfile } = useAuthContext();
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const handleLogout = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating user status on logout:', error);
      }
    }
    try {
      await signOut(auth);
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Heart className="w-8 h-8" />
          <h1 className="text-2xl font-headline font-semibold">Dostigram</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/chat" passHref>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Chat</Button>
              </Link>
              <Link href="/profile" passHref>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  {userProfile?.photoURL ? (
                     <Avatar className="h-6 w-6">
                       <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName || 'User'} />
                       <AvatarFallback>{userProfile.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                     </Avatar>
                  ): (
                    <UserCircle className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">{userProfile?.displayName || user.email}</span>
                </Button>
              </Link>
               <Link href="/pricing" passHref>
                <Button variant="ghost" size="sm" className="text-accent-foreground hover:bg-accent/80 hidden sm:inline-flex">
                  <Crown className="w-4 h-4 mr-1"/>
                  Pricing
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5">
                <LogOut className="w-5 h-5 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref> {/* Corrected link */}
                <Button variant="ghost">
                  <LogIn className="w-5 h-5 mr-1" />
                  Login
                </Button>
              </Link>
              <Link href="/signup" passHref> {/* Corrected link */}
                <Button variant="default">
                  <UserPlus className="w-5 h-5 mr-1" />
                  Sign Up
                </Button>
              </Link>
              <Link href="/pricing" passHref>
                <Button variant="ghost" className="text-accent-foreground hover:bg-accent/80 hidden sm:inline-flex">
                   <Crown className="w-4 h-4 mr-1"/>
                  Pricing
                </Button>
              </Link>
            </>
          )}
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 text-sm">
                No new notifications.
              </PopoverContent>
            </Popover>
          )}
        </nav>
      </div>
    </header>
  );
}
