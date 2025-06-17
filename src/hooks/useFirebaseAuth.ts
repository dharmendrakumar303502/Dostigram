
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  displayName: string;
  photoURL: string | null;
  email: string | null;
  uid: string;
  bio?: string; // Added bio
  hasActiveStory?: boolean; // Added for stories look
  isProUser?: boolean;
  trialEndDate?: Timestamp | null;
  lastSeen?: Timestamp; 
  isOnline?: boolean;
}

export default function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, "users", authUser.uid);

        try {
          await updateDoc(userDocRef, {
            isOnline: true,
            lastSeen: serverTimestamp(),
          });
        } catch (error) {
          // User doc might not exist yet if signup is in progress, handle gracefully
          if ((error as any).code === 'not-found') {
            console.warn("User document not found on auth state change, likely during signup.");
          } else {
            console.error("Error updating online status on login:", error);
          }
        }
        
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setUserProfile(profileData);
            setIsProUser(profileData.isProUser || false);

            if (profileData.trialEndDate && !profileData.isProUser) {
              const endDate = profileData.trialEndDate.toDate(); // Convert Timestamp to Date
              const now = new Date();
              const diffTime = endDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setTrialDaysLeft(diffDays > 0 ? diffDays : 0);
            } else if (profileData.isProUser) {
              setTrialDaysLeft(null); 
            } else {
              setTrialDaysLeft(0); // Default to 0 if no trial or not pro
            }
          } else {
            // This case might happen if the document is deleted or during initial signup before doc creation
            // For a fresh signup, the signup form will create the document.
            // If an existing user's doc is missing, this is an anomaly.
            console.warn(`User document for UID ${authUser.uid} not found.`);
            setUserProfile(null); 
            setIsProUser(false);
            setTrialDaysLeft(0);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile snapshot:", error);
          setUserProfile(null);
          setIsProUser(false);
          setTrialDaysLeft(0);
          setLoading(false);
        });
        return () => unsubscribeProfile();

      } else {
        setUser(null);
        setUserProfile(null);
        setIsProUser(false);
        setTrialDaysLeft(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return {
    user,
    userProfile,
    loading,
    isProUser,
    trialDaysLeft,
  };
}

