'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      // Redirect to the role-specific view
      const roleRoutes: Record<string, string> = {
        prep:   '/',
        cook:   '/',
        server: '/',
        admin:  '/admin',
      };
      router.push(roleRoutes[data.role] ?? '/');
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚓</div>
          <h1 className="text-2xl font-bold text-[#1B3A5C]">Pellito Hub</h1>
          <p className="text-sm text-[#666] mt-1">Deckhand Kitchen Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#444] mb-1">
              Station login
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. cook"
              required
              className="w-full border border-[#ccc] rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#006D77]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#444] mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-[#ccc] rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#006D77]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200
                          rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#526a8d] hover:bg-[#1B3A5C] text-white font-semibold
                       rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-[#aaa] mt-6">
          Sessions end when you close this tab.
        </p>
      </div>
    </div>
  );
}
