'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  function create() {
    const code = generateCode();
    router.push(`/room/${code}`);
  }

  function join() {
    const code = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) return;
    router.push(`/room/${code}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7 text-white">
            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
            <rect x="8" y="8" width="12" height="12" rx="2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Croxshare</h1>
          <p className="text-sm text-gray-500">Instant P2P file sharing</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Create room */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Send files</h2>
          <p className="mt-1 text-sm text-gray-500">Create a room and share the code with the receiver.</p>
          <button
            onClick={create}
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Create Room
          </button>
        </div>

        {/* Join room */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Receive files</h2>
          <p className="mt-1 text-sm text-gray-500">Enter the 6-character code from the sender.</p>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder="ABC-123"
            maxLength={6}
            className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-bold tracking-widest text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={join}
            disabled={joinCode.length !== 6}
            className="mt-3 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition"
          >
            Join Room
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-12 grid max-w-sm gap-3 sm:grid-cols-3 sm:max-w-2xl">
        {[
          { n: '1', t: 'Create a room', d: 'Click "Create Room" on the sending device.' },
          { n: '2', t: 'Share the code', d: 'The receiver enters the 6-char code or scans QR.' },
          { n: '3', t: 'Transfer directly', d: 'Files go browser → browser. Nothing touches a server.' },
        ].map((s) => (
          <div key={s.n} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">{s.n}</div>
            <p className="text-sm font-medium text-gray-800">{s.t}</p>
            <p className="mt-0.5 text-xs text-gray-500">{s.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-400">
        No login · No cloud · Files never leave your browser
      </p>
    </div>
  );
}
