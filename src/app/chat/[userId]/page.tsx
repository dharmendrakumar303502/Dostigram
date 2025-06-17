
'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, Send, Smile, Check, CheckCheck, MessageCircleHeart, Heart, ThumbsUp, SmilePlus, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, Timestamp, updateDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/hooks/useFirebaseAuth';
import { cn } from '@/lib/utils';

interface Reaction {
  [emoji: string]: string[]; // emoji: array of user UIDs who reacted
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp | null;
  photoURL?: string | null;
  displayName?: string;
  isSeen?: boolean;
  seenAt?: Timestamp | null;
  reactions?: Reaction;
}

const availableReactions = ['❤️', '😂', '👍', '😢', '🎉', '🔥'];

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { userId: otherUserIdString } = params;
  const otherUserId = otherUserIdString as string;
  const { user, userProfile: currentUserProfile } = useAuthContext();
  
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openReactionPopover, setOpenReactionPopover] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false); // Placeholder for typing status

  useEffect(() => {
    if (!user || !otherUserId) {
      setLoading(false);
      return;
    }

    const fetchOtherUserData = async () => {
      const userDocRef = doc(db, 'users', otherUserId);
      // Listen for real-time updates on otherUser's profile (e.g., online status)
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setOtherUser(docSnap.data() as UserProfile);
        } else {
          console.error("Other user not found");
        }
      });
      return unsubscribeUser;
    };
    
    const unsubscribeOtherUser = fetchOtherUserData();

    const chatIdPart1 = user.uid < otherUserId ? user.uid : otherUserId;
    const chatIdPart2 = user.uid > otherUserId ? user.uid : otherUserId;
    const chatId = `${chatIdPart1}_${chatIdPart2}`;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
      const fetchedMessages: Message[] = [];
      const batch = writeBatch(db);
      let hasUnseenMessagesToUpdate = false;
      let currentOtherUser = otherUser; // Use state variable that might be updated by its own listener

      for (const messageDoc of snapshot.docs) {
        const data = messageDoc.data();
        let senderProfile: UserProfile | null = null;

        if (data.senderId === user.uid) {
            senderProfile = currentUserProfile;
        } else if (data.senderId === otherUserId) {
            // If otherUser state isn't populated yet, fetch it once
            if (!currentOtherUser) {
                 const userSnap = await getDoc(doc(db, 'users', data.senderId));
                 if (userSnap.exists()) currentOtherUser = userSnap.data() as UserProfile;
            }
            senderProfile = currentOtherUser;
        }
        
        const message = { 
          id: messageDoc.id,
          ...data,
          photoURL: senderProfile?.photoURL,
          displayName: senderProfile?.displayName
        } as Message;
        fetchedMessages.push(message);

        if (message.receiverId === user.uid && message.senderId === otherUserId && !message.isSeen) {
          const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
          batch.update(messageRef, { isSeen: true, seenAt: serverTimestamp() });
          hasUnseenMessagesToUpdate = true;
        }
      }
      setMessages(fetchedMessages);
      setLoading(false);

      if (hasUnseenMessagesToUpdate) {
        try {
          await batch.commit();
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      }
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });
    
    return () => {
      unsubscribeMessages();
      // Clean up otherUser listener if it was set up
      if (typeof unsubscribeOtherUser === 'function') {
        unsubscribeOtherUser();
      } else {
        unsubscribeOtherUser.then(unsub => unsub && unsub());
      }
    };

  }, [user, otherUserId, currentUserProfile]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !otherUserId || newMessage.trim() === '') return;

    const chatIdPart1 = user.uid < otherUserId ? user.uid : otherUserId;
    const chatIdPart2 = user.uid > otherUserId ? user.uid : otherUserId;
    const chatId = `${chatIdPart1}_${chatIdPart2}`;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    try {
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: user.uid,
        receiverId: otherUserId,
        timestamp: serverTimestamp(),
        isSeen: false,
        seenAt: null,
        reactions: {}, 
      });
      
      const chatMetaRefUser = doc(db, 'users', user.uid, 'chats', otherUserId);
      const chatMetaRefOther = doc(db, 'users', otherUserId, 'chats', user.uid);
      const lastMessageDataUser = {
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
        unread: false, 
      };
       const lastMessageDataOther = {
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
        unread: true, 
      };
      await setDoc(chatMetaRefUser, lastMessageDataUser, { merge: true });
      await setDoc(chatMetaRefOther, lastMessageDataOther, { merge: true });

      setNewMessage('');
      setShowEmojiPicker(false);
      // Placeholder: set isTyping to false after sending a message
      // Real implementation would involve debouncing and network events
      setIsTyping(false); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    // Placeholder: set isTyping to true when user types
    // Real implementation would be more complex (e.g., debounce)
    if (e.target.value.trim().length > 0 && !isTyping) {
        // setIsTyping(true); 
        // Send typing event to Firestore (out of scope for this update)
    } else if (e.target.value.trim().length === 0 && isTyping) {
        // setIsTyping(false);
        // Send stopped typing event (out of scope)
    }
  };


  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prevMessage => prevMessage + emojiData.emoji);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    const chatIdPart1 = user.uid < otherUserId ? user.uid : otherUserId;
    const chatIdPart2 = user.uid > otherUserId ? user.uid : otherUserId;
    const chatId = `${chatIdPart1}_${chatIdPart2}`;
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

    try {
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;

      const messageData = messageDoc.data() as Message;
      const currentReactions = messageData.reactions || {};
      const usersForEmoji = currentReactions[emoji] || [];

      const userHasReacted = usersForEmoji.includes(user.uid);

      const newReactions = { ...currentReactions };

      if (userHasReacted) {
        newReactions[emoji] = usersForEmoji.filter(uid => uid !== user.uid);
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        newReactions[emoji] = [...usersForEmoji, user.uid];
      }
      
      await updateDoc(messageRef, { reactions: newReactions });
      setOpenReactionPopover(null); 
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };


  if (loading && messages.length === 0) {
    return <div className="flex flex-col h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="mt-4 text-muted-foreground">Loading chat...</p></div>;
  }
  if (!otherUser && !loading) {
    return <div className="flex flex-col h-full items-center justify-center"><p>User not found or chat cannot be loaded.</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <CardHeader className="p-4 border-b flex flex-row items-center gap-3 sticky top-0 bg-card z-10">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {otherUser && (
          <>
            <div className="relative">
                <Avatar>
                <AvatarImage src={otherUser.photoURL || undefined} alt={otherUser.displayName || 'User'} data-ai-hint="avatar person" />
                <AvatarFallback>{otherUser.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                {otherUser.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                )}
            </div>
            <div>
              <CardTitle className="text-lg font-headline">{otherUser.displayName || 'Chat User'}</CardTitle>
              <p className={`text-xs ${otherUser.isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isTyping ? <span className="italic text-primary">Typing...</span> : 
                 otherUser.isOnline ? 'Online' : `Last seen: ${otherUser.lastSeen ? new Date(otherUser.lastSeen.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Unavailable'}`}
              </p>
            </div>
          </>
        )}
      </CardHeader>

      <ScrollArea className="flex-grow p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group relative flex items-end gap-2 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            {msg.senderId !== user?.uid && otherUser && (
              <Avatar className="h-8 w-8 self-start shrink-0">
                <AvatarImage src={otherUser.photoURL || undefined} alt={otherUser.displayName || "Sender"} />
                <AvatarFallback>{otherUser.displayName?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md flex flex-col ${
                msg.senderId === user?.uid
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground border rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              <div className={`text-xs mt-1 flex items-center gap-1 ${msg.senderId === user?.uid ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground/70 justify-start'}`}>
                <span>
                  {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                </span>
                {msg.senderId === user?.uid && msg.timestamp && (
                  msg.isSeen ? <CheckCheck className="h-4 w-4 text-accent" /> : <Check className="h-4 w-4 text-primary-foreground/70" />
                )}
              </div>
               {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className={`mt-1.5 flex flex-wrap gap-1 ${msg.senderId === user?.uid ? 'justify-end' : ''}`}>
                  {Object.entries(msg.reactions).map(([emoji, uids]) => (
                    uids.length > 0 && (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        className={cn(
                          "px-1.5 py-0.5 rounded-full text-xs flex items-center gap-0.5 transition-all",
                          uids.includes(user?.uid || '') 
                            ? "bg-accent/30 border border-accent text-accent-foreground" 
                            : "bg-muted/50 hover:bg-muted",
                          msg.senderId === user?.uid ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}
                      >
                        <span>{emoji}</span>
                        <span className="text-xs">{uids.length}</span>
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
            
            <Popover open={openReactionPopover === msg.id} onOpenChange={(isOpen) => setOpenReactionPopover(isOpen ? msg.id : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 rounded-full w-7 h-7 p-1",
                    msg.senderId === user?.uid ? "-left-2 top-1/2 -translate-x-full -translate-y-1/2" : "-right-2 top-1/2 translate-x-full -translate-y-1/2",
                    "bg-background/70 backdrop-blur-sm hover:bg-muted"
                  )}
                   onClick={() => setOpenReactionPopover(openReactionPopover === msg.id ? null : msg.id)}
                >
                  <SmilePlus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-1 w-auto rounded-full shadow-xl bg-card border-border flex gap-0.5">
                {availableReactions.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 hover:bg-accent/20 transform hover:scale-125 transition-transform"
                    onClick={() => handleReaction(msg.id, emoji)}
                  >
                    <span className="text-lg">{emoji}</span>
                  </Button>
                ))}
              </PopoverContent>
            </Popover>

             {msg.senderId === user?.uid && currentUserProfile && (
              <Avatar className="h-8 w-8 self-start shrink-0">
                <AvatarImage src={currentUserProfile.photoURL || undefined} alt={currentUserProfile.displayName || "You"} />
                <AvatarFallback>{currentUserProfile.displayName?.[0]?.toUpperCase() || 'Y'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t sticky bottom-0 bg-card">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto border-0" side="top" align="start">
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                autoFocusSearch={false}
                lazyLoadEmojis
                height={350}
                searchDisabled
                skinTonesDisabled
                previewConfig={{showPreview: false}}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleNewMessageChange}
            className="flex-grow"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
      {/* Floating Action Button Placeholder */}
      <Button
        variant="default"
        size="icon"
        className="absolute bottom-20 right-4 h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
        onClick={() => console.log("FAB clicked - placeholder for media upload")}
        aria-label="Add attachment"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
