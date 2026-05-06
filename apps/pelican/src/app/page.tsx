'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrepView from '@/components/views/PrepView';
import CookView from '@/components/views/CookView';
import ServerView from '@/components/views/ServerView';

export default function Home() {
  const [role, setRole] = useState<'prep' | 'cook' | 'server'>('prep');
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <nav className="bg-[#526a8d] text-white p-4 flex gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl">⚓ Pellito Hub</span>
          <div className="flex bg-[#445b7d] rounded-md overflow-hidden">
            <button
              onClick={() => setRole('prep')}
              className={`px-4 py-2 text-sm transition-colors ${role === 'prep' ? 'bg-[#1B3A5C]' : 'hover:bg-[#526a8d]'}`}
            >
              Prep
            </button>
            <button
              onClick={() => setRole('cook')}
              className={`px-4 py-2 text-sm transition-colors ${role === 'cook' ? 'bg-[#1B3A5C]' : 'hover:bg-[#526a8d]'}`}
            >
              Cook
            </button>
            <button
              onClick={() => setRole('server')}
              className={`px-4 py-2 text-sm transition-colors ${role === 'server' ? 'bg-[#1B3A5C]' : 'hover:bg-[#526a8d]'}`}
            >
              Server
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </nav>

      {role === 'prep'   && <PrepView />}
      {role === 'cook'   && <CookView />}
      {role === 'server' && <ServerView />}
    </main>
  );
}
