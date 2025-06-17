
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Crown, Zap, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';

export default function PricingPage() {
  const { user, isProUser } = useAuthContext();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleSimulatePayment = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to upgrade.", variant: "destructive"});
      return;
    }
    if (isProUser) {
      toast({ title: "Already Pro!", description: "You are already a Dosti Pro member."});
      return;
    }
    setIsUpgrading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isProUser: true,
        trialEndDate: null, // Clear trial end date if they upgrade
      });
      toast({ title: "Upgrade Successful!", description: "Welcome to Dosti Pro! Enjoy unlimited features."});
    } catch (error) {
      console.error("Error upgrading to pro:", error);
      toast({ title: "Upgrade Failed", description: "Something went wrong. Please try again.", variant: "destructive"});
    } finally {
      setIsUpgrading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <Crown className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
          Dostigram Pricing
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Enjoy seamless chatting with your friends. Start with a free trial and upgrade to unlock the full Dostigram experience.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300 bg-card/70 backdrop-blur-md">
          <CardHeader className="text-center">
            <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
            <CardTitle className="font-headline text-2xl">Free Trial</CardTitle>
            <CardDescription>Get started for free</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-4xl font-bold font-headline">
              ₹0 <span className="text-lg font-normal text-muted-foreground">/ for 3 days</span>
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Real-time text chat</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> User profiles & bio</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Online/Offline status</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Limited to 5 chats</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/signup" passHref>
              <Button size="lg" variant="outline" className="w-full">Start Your Free Trial</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-xl border-2 border-accent relative overflow-hidden bg-card/70 backdrop-blur-md">
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold rounded-bl-md">BEST VALUE</div>
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 text-accent mx-auto mb-3" />
            <CardTitle className="font-headline text-2xl">Dosti Pro</CardTitle>
            <CardDescription>Unlock all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-4xl font-bold font-headline">
              ₹99 <span className="text-lg font-normal text-muted-foreground">/ month</span>
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Everything in Free Trial, plus:</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Unlimited chats</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Media messaging (Coming Soon)</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Advanced profile customization</li>
              <li className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Priority support</li>
            </ul>
            {!isProUser && user && (
              <div className="mt-6 border-t pt-4">
                 <h4 className="text-md font-semibold mb-2 text-foreground">Scan UPI QR & Upgrade</h4>
                <div className="flex justify-center my-3">
                   <Image src="https://placehold.co/150x150.png?text=UPI+QR" alt="UPI QR Code" width={150} height={150} className="rounded-md shadow-md" data-ai-hint="upi payment" />
                </div>
                <p className="text-xs text-muted-foreground mb-3">After payment, click below to confirm.</p>
                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleSimulatePayment} disabled={isUpgrading}>
                  {isUpgrading ? "Upgrading..." : "I've Made The Payment"}
                </Button>
              </div>
            )}
             {isProUser && (
                <p className="mt-4 text-green-600 font-semibold">You are already a Dosti Pro member! 🎉</p>
             )}
             {!user && (
                <p className="mt-4 text-muted-foreground">
                    <Link href="/auth/login" className="text-primary hover:underline">Login</Link> or <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link> to subscribe.
                </p>
             )}
          </CardContent>
          <CardFooter className="flex justify-center mt-auto">
            {/* Button removed if user is logged in and not pro, as payment sim is inside content */}
            {(!user || isProUser) && (
                 <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isProUser}>
                    {isProUser ? "You're Already Pro!" : "Get Dosti Pro"}
                </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <section className="mt-16 text-center">
        <h3 className="text-xl font-headline font-semibold mb-2">Frequently Asked Questions</h3>
        <p className="text-muted-foreground mb-4">
          <strong>How does the 3-day free trial work?</strong><br/>
          When you sign up, you get 3 days of full access to basic Dostigram features. No credit card required for the trial.
        </p>
        <p className="text-muted-foreground">
          <strong>What happens after the trial?</strong><br/>
          After 3 days, you'll be prompted to subscribe to Dosti Pro for ₹99/month to continue using all features.
          You can still log in but chat functionality might be limited.
        </p>
      </section>
    </div>
  );
}

