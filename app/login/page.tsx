'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/upload');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-border">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">WSM Assets Uploader</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground bg-input"
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
