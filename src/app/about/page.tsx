
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Heart, Users, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Dostigram',
  description: 'Learn more about Dostigram, its mission, and its creator.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-xl bg-card/80 backdrop-blur-lg border-primary/20">
        <CardHeader className="text-center border-b pb-6">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle className="font-headline text-4xl">About Dostigram</CardTitle>
          <CardDescription className="text-lg">Connecting the next generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 py-8 md:px-8">
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-headline font-semibold text-primary mb-3">
              <Rocket className="w-6 h-6" />
              What is Dostigram?
            </h2>
            <p className="text-foreground leading-relaxed text-base">
              Dostigram is a modern social chat platform designed for students and youth, aiming to blend seamless real-time messaging with engaging social features. Inspired by the best of WhatsApp and Instagram, Dostigram offers a futuristic, fun, and addictive communication experience for 2025 and beyond.
            </p>
          </section>
          
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-headline font-semibold text-primary mb-3">
              <Users className="w-6 h-6" />
              Our Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Our vision is to create a vibrant digital space where young individuals can connect, share, and express themselves freely and securely. We believe in fostering genuine connections through an intuitive and stylish platform that keeps up with the dynamic lifestyle of GenZ.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-headline font-semibold text-primary mb-3">
              <Info className="w-6 h-6" />
              The Creator
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Dostigram is proudly created and managed by <strong className="text-foreground">Dharmendra Kumar Meena</strong> in {new Date().getFullYear()}.
              This application is born from a passion for technology and a vision for enhancing how the next generation communicates.
            </p>
            <p className="mt-3 text-sm text-muted-foreground italic">
              Thank you for being a part of the Dostigram journey!
            </p>
          </section>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground pt-6 border-t">
          Dostigram © {new Date().getFullYear()} | For the love of connection.
        </CardFooter>
      </Card>
    </div>
  );
}
