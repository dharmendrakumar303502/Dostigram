
'use client';
import type { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarMenuSkeleton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageSquare, Users, Settings, Loader2, PlusCircle, LogOut, Info } from 'lucide-react';
import Link from 'next/link';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { UserProfile } from '@/hooks/useFirebaseAuth';
import { signOut, updateCurrentUser } from 'firebase/auth';
import { cn } from '@/lib/utils';

interface ChatUser extends UserProfile {
  lastMessage?: string;
  lastMessageTimestamp?: Date;
  unread?: boolean;
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, userProfile: currentUserProfile } = useAuthContext();
  const router = useRouter();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For manual control if needed via SidebarProvider props

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && currentUserProfile) { // Ensure currentUserProfile is available
      const usersRef = collection(db, 'users');
      
      const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
        const usersData: ChatUser[] = [];
        for (const userDoc of snapshot.docs) {
          if (userDoc.id !== user.uid) { 
            const userData = userDoc.data() as UserProfile;
            
            let lastMessageData: { lastMessage?: string; timestamp?: Timestamp; unread?: boolean } = {};
            try {
              const chatMetaRef = doc(db, 'users', user.uid, 'chats', userDoc.id);
              const chatMetaSnap = await getDoc(chatMetaRef);
              if (chatMetaSnap.exists()) {
                lastMessageData = chatMetaSnap.data() as { lastMessage?: string; timestamp?: Timestamp; unread?: boolean };
              }
            } catch (e) { console.error("Error fetching chat meta for user", userDoc.id, ":", e)}

            usersData.push({
              ...userData,
              lastMessage: lastMessageData.lastMessage,
              lastMessageTimestamp: lastMessageData.timestamp?.toDate(),
              unread: lastMessageData.unread
            });
          }
        }
        usersData.sort((a, b) => {
          if (a.unread && !b.unread) return -1;
          if (!a.unread && b.unread) return 1;
          const timeA = a.lastMessageTimestamp?.getTime() || 0;
          const timeB = b.lastMessageTimestamp?.getTime() || 0;
          return timeB - timeA;
        });
        setChatUsers(usersData);
        setLoadingUsers(false);
      });

      return () => unsubscribeUsers();
    } else if (!user && !authLoading) {
      setLoadingUsers(false); // Not logged in, no users to load
    }
  }, [user, currentUserProfile, authLoading]);

  const handleLogout = async () => {
    try {
      // Firestore update for isOnline status is handled in Header for consistency
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !currentUserProfile) { // Ensure currentUserProfile is also checked
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><p>Redirecting to login...</p></div>;
  }
  
  const filteredUsers = chatUsers.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider defaultOpen={true} open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="flex h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r transition-all duration-300 ease-in-out" side="left">
          <SidebarHeader className="p-3">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center mb-2">
               <Link href="/profile" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden overflow-hidden">
                {currentUserProfile && (
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={currentUserProfile.photoURL || undefined} alt={currentUserProfile.displayName || 'User'} data-ai-hint="user avatar"/>
                    <AvatarFallback className="text-sm">{currentUserProfile.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <span className="font-semibold font-headline text-lg truncate">{currentUserProfile?.displayName || "User"}</span>
              </Link>
              <SidebarTrigger className="md:hidden" /> {/* Hamburger for mobile */}
               <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:mx-auto" /> {/* Trigger for desktop when collapsed */}
            </div>
             <Input 
                placeholder="Search or start new chat..." 
                className="h-9 group-data-[collapsible=icon]:hidden"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full px-2">
              {loadingUsers && user ? ( // Only show skeleton if user is logged in and users are loading
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
                </div>
              ) : (
                <SidebarMenu>
                  {filteredUsers.map((chatUser) => (
                    <SidebarMenuItem key={chatUser.uid}>
                      <Link href={`/chat/${chatUser.uid}`} className="w-full block"
                        onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false);}} // Close sidebar on mobile tap
                      >
                        <SidebarMenuButton
                          tooltip={{ children: chatUser.displayName || 'User', className: "group-data-[collapsible=icon]:visible hidden text-xs py-1 px-2" }}
                          className="flex justify-between items-center w-full h-auto py-2.5 px-2 hover:bg-muted"
                          isActive={router.asPath === `/chat/${chatUser.uid}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative shrink-0">
                                <Avatar className="h-10 w-10">
                                <AvatarImage src={chatUser.photoURL || undefined} alt={chatUser.displayName || 'User'} data-ai-hint="avatar person" />
                                <AvatarFallback>{chatUser.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                {chatUser.isOnline && (
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                                )}
                                {chatUser.hasActiveStory && ( // Visual cue for story
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent ring-2 ring-pink-500 group-hover:ring-pink-400 transition-all"></div>
                                )}
                            </div>
                            <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden min-w-0">
                              <span className={cn("font-medium truncate text-sm", chatUser.unread && "font-bold")}>{chatUser.displayName}</span>
                              {chatUser.lastMessage && (
                                <span className={cn("text-xs truncate", chatUser.unread ? 'text-foreground/90' : 'text-muted-foreground')}>
                                  {chatUser.lastMessage}
                                </span>
                              )}
                            </div>
                          </div>
                          {chatUser.unread && (
                            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                   {filteredUsers.length === 0 && !loadingUsers && (
                    <p className="text-center text-sm text-muted-foreground py-4 group-data-[collapsible=icon]:hidden">No users found.</p>
                   )}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-2 mt-auto border-t">
             <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/about" className="w-full block">
                         <SidebarMenuButton tooltip={{ children: "About Dostigram", className: "group-data-[collapsible=icon]:visible hidden text-xs py-1 px-2" }}>
                            <Info /> <span className="group-data-[collapsible=icon]:hidden">About</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/profile" className="w-full block">
                        <SidebarMenuButton tooltip={{ children: "Profile Settings", className: "group-data-[collapsible=icon]:visible hidden text-xs py-1 px-2" }}>
                            <Settings /> <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip={{ children: "Logout", className: "group-data-[collapsible=icon]:visible hidden text-xs py-1 px-2" }}>
                        <LogOut /> <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-y-auto"> {/* Ensure this allows scrolling for chat content */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

    