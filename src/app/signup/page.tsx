import SignupForm from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold text-center mb-2 text-foreground">
        Join Dostigram
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Create your account to start chatting with friends.
      </p>
      <SignupForm />
    </div>
  );
}
