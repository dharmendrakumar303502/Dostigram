import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Heart className="w-24 h-24 text-primary mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-headline font-bold mb-6">
            Welcome to <span className="text-primary">Dostigram</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            Connect with your friends, classmates, and colleagues in real-time. Simple, fast, and fun messaging for students.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login" passHref>
              <Button size="lg" variant="outline">
                Login to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card rounded-lg shadow-lg">
        <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-12">Why Dostigram?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-headline font-medium mb-2">Real-Time Chat</h3>
            <p className="text-muted-foreground">Instantly send and receive messages with our blazing fast chat interface.</p>
          </div>
          <div className="p-6">
            <Users className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-headline font-medium mb-2">Youth Friendly</h3>
            <p className="text-muted-foreground">Designed with students in mind, offering a clean and attractive user experience.</p>
          </div>
          <div className="p-6">
            <Image src="https://placehold.co/100x100.png" alt="Profile Feature" width={100} height={100} className="mx-auto mb-4 rounded-full" data-ai-hint="avatar user" />
            <h3 className="text-xl font-headline font-medium mb-2">User Profiles</h3>
            <p className="text-muted-foreground">Create your profile, add a display picture, and manage your account easily.</p>
          </div>
        </div>
      </section>
       <section className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-6">Ready to Connect?</h2>
        <p className="text-lg text-muted-foreground mb-8">Join Dostigram today and start chatting!</p>
        <Link href="/auth/signup" passHref>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Sign Up Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
