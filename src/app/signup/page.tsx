export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full border px-4 py-2 rounded" />
          <input type="email" placeholder="Email" className="w-full border px-4 py-2 rounded" />
          <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded" />
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded">Create Account</button>
        </form>
      </div>
    </div>
  );
}
