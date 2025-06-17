import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold text-center mb-2 text-foreground">
        Welcome Back!
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Enter your credentials to access your Dostigram account.
      </p>
      <LoginForm />
    </div>
  );
}
