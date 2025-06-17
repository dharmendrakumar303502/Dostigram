
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { Camera, Edit3, Loader2, Save, ThumbsUp, Users, FileText } from 'lucide-react';
import type { UserProfile } from '@/hooks/useFirebaseAuth';

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading, isProUser, trialDaysLeft } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setPhotoPreview(userProfile.photoURL || null);
    }
  }, [userProfile]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    try {
      let photoURL = userProfile?.photoURL || null;
      if (newPhoto) {
        const photoRef = ref(storage, `profilePictures/${user.uid}/${newPhoto.name}`);
        const snapshot = await uploadBytes(photoRef, newPhoto);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      await updateFirebaseProfile(user, { displayName, photoURL });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName,
        photoURL,
        bio, // Save bio
      });

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 py-8 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /> <p className="mt-4 text-muted-foreground">Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-primary/20 transition-all duration-300 hover:shadow-primary/20">
        <CardHeader className="pb-2">
            {!isEditing && userProfile && (
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative group">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary shadow-lg transition-transform group-hover:scale-105">
                            <AvatarImage src={photoPreview || undefined} alt={displayName || 'User'} data-ai-hint="user avatar" />
                            <AvatarFallback className="text-5xl bg-muted">
                            {displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                         {userProfile.hasActiveStory && (
                            <div className="absolute inset-0 rounded-full border-4 border-transparent ring-4 ring-pink-500 ring-offset-2 ring-offset-card transition-all group-hover:ring-pink-400"></div>
                        )}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <CardTitle className="font-headline text-3xl md:text-4xl mb-1">{displayName}</CardTitle>
                        <p className="text-muted-foreground text-sm mb-3">{user.email}</p>
                        <p className="text-foreground whitespace-pre-line text-sm mb-4">{bio || (isEditing ? '' : 'No bio yet.')}</p>
                        <div className="flex justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                            <div className="text-center">
                                <p className="font-semibold text-foreground">0</p>
                                <p>Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-foreground">0</p>
                                <p>Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-foreground">0</p>
                                <p>Following</p>
                            </div>
                        </div>
                         <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full md:w-auto">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                 </div>
            )}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {isEditing ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary shadow-md">
                    <AvatarImage src={photoPreview || undefined} alt={displayName || 'User'} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-4xl bg-muted">
                      {displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="w-5 h-5" />
                    <Input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" placeholder="Tell us about yourself..." rows={3} />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <CardDescription>Account Status</CardDescription>
              {isProUser ? (
                <p className="text-green-600 font-semibold flex items-center"><ThumbsUp className="w-5 h-5 mr-2 text-green-500"/> Subscription: Pro User ✨</p>
              ) : trialDaysLeft !== null && trialDaysLeft > 0 ? (
                <p className="text-accent-foreground"><strong className="font-medium text-foreground">Trial:</strong> {trialDaysLeft} days left</p>
              ) : (
                 <p className="text-destructive-foreground bg-destructive p-2 rounded-md"><strong className="font-medium text-foreground">Subscription:</strong> Trial Expired. <Button variant="link" size="sm" className="p-0 h-auto text-destructive-foreground hover:underline" onClick={() => window.location.href='/pricing'}>Upgrade to Pro</Button></p>
              )}
            </div>
          )}
        </CardContent>
        {isEditing && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {setIsEditing(false); setNewPhoto(null); setPhotoPreview(userProfile?.photoURL || null); setDisplayName(userProfile?.displayName || ''); setBio(userProfile?.bio || ''); }}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
        )}
      </Card>
      <div className="mt-8 text-center text-xs text-muted-foreground italic">
        Crafted by Dharmendra Kumar Meena – with vision for GenZ 📱
      </div>
    </div>
  );
}
