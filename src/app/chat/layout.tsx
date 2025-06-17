
'use client';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Settings, User, Users, PlusCircle, Search, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/hooks/useFirebaseAuth';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthContext();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    setLoadingUsers(true);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });
      setUsers(fetchedUsers);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center"><p>Please log in to access chat.</p></div>;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-2 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" asChild>
              <SidebarTrigger><MessageSquare className="h-5 w-5" /></SidebarTrigger>
            </Button>
            <Input 
              placeholder="Search users..." 
              className="h-8 text-sm group-data-[collapsible=icon]:hidden"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {loadingUsers ? (
                 Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i} className="p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="animate-pulse bg-muted"></AvatarFallback></Avatar>
                      <div className="h-4 w-24 bg-muted rounded animate-pulse group-data-[collapsible=icon]:hidden"></div>
                    </div>
                  </SidebarMenuItem>
                 ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((chatUser) => (
                  <SidebarMenuItem key={chatUser.uid}>
                    <Link href={`/chat/${chatUser.uid}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === `/chat/${chatUser.uid}`}
                        className="flex items-center justify-start w-full"
                        tooltip={{ children: chatUser.displayName || chatUser.email || 'User', side: 'right' }}
                      >
                        <div className="relative">
                          <Avatar className="h-7 w-7 mr-2 shrink-0">
                            <AvatarImage src={chatUser.photoURL || undefined} alt={chatUser.displayName || 'User'} data-ai-hint="avatar person" />
                            <AvatarFallback className={`${chatUser.isOnline ? "border-2 border-green-500" : ""} 
                                                       ${chatUser.hasActiveStory ? "border-pink-500" : ""}`}>
                              {chatUser.displayName?.[0]?.toUpperCase() || chatUser.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {chatUser.hasActiveStory && (
                            <div className="absolute -inset-0.5 rounded-full ring-2 ring-pink-500 group-data-[collapsible=icon]:ring-offset-0 group-data-[collapsible=icon]:ring-pink-500 transition-all"></div>
                          )}
                        </div>
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {chatUser.displayName || chatUser.email}
                        </span>
                         {chatUser.isOnline && (
                           <span className="ml-auto h-2 w-2 rounded-full bg-green-500 group-data-[collapsible=icon]:hidden"></span>
                         )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                  No users found.
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 mt-auto border-t">
             <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/profile" passHref legacyBehavior>
                    <SidebarMenuButton tooltip={{ children: "Profile", side: 'right' }}>
                      <User className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/about" passHref legacyBehavior>
                    <SidebarMenuButton tooltip={{ children: "About Dostigram", side: 'right' }} isActive={pathname === '/about'}>
                      <Info className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">About</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
           <div className="p-2 border-b md:hidden"> {/* Mobile header for current chat */}
            <SidebarTrigger><MessageSquare className="h-5 w-5" /></SidebarTrigger>
          </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
