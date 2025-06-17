
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';

const signupSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters' }).max(30),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, {
          displayName: data.displayName,
        });

        const userDocRef = doc(db, 'users', user.uid);
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: data.displayName,
          email: user.email,
          photoURL: user.photoURL, 
          bio: '', // Initialize bio
          hasActiveStory: false, // Initialize hasActiveStory
          createdAt: serverTimestamp(),
          isProUser: false,
          trialEndDate: Timestamp.fromDate(trialEndDate), 
          lastSeen: serverTimestamp(),
          isOnline: true,
        });
      }
      
      toast({
        title: 'Account Created!',
        description: 'Welcome to Dostigram! Your 3-day trial has started.',
      });
      router.push('/chat'); 
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="displayName" className={errors.displayName ? "text-destructive": ""}>Display Name</Label>
        <Input
          id="displayName"
          type="text"
          {...register('displayName')}
          className={`mt-1 ${errors.displayName ? "border-destructive focus-visible:ring-destructive" : ""}`}
          placeholder="Your Name"
        />
        {errors.displayName && <p className="mt-1 text-sm text-destructive">{errors.displayName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className={errors.email ? "text-destructive": ""}>Email Address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className={`mt-1 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password" className={errors.password ? "text-destructive": ""}>Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className={`mt-1 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Create Account
      </Button>
    </form>
  );
}

