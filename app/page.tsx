'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode, normalizeRoomCode } from '@/lib/utils';

const steps = [
  { n: '01', t: 'Create room', d: 'Open a private room in one tap and share the code instantly.' },
  { n: '02', t: 'Join cleanly', d: 'Use the room code from another device and enter the transfer flow without friction.' },
  { n: '03', t: 'Transfer direct', d: 'Once connected, the interface stays focused on the file handoff itself.' },
];

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  function create() {
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  }

  function join() {
    const code = normalizeRoomCode(joinCode);
    if (code.length !== 6) return;
    router.push(`/room/${code}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute left-8 top-12 h-32 w-32 rounded-full bg-[rgba(184,92,56,0.16)] blur-3xl" />
      <div className="absolute bottom-16 right-8 h-40 w-40 rounded-full bg-[rgba(31,122,114,0.16)] blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative rounded-[2rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,250,242,0.72)] p-7 shadow-[0_28px_80px_rgba(92,58,30,0.12)] backdrop-blur md:p-10 lg:p-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(102,72,37,0.12)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            Croxshare
          </div>

          <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-[var(--text)] sm:text-6xl lg:text-7xl">
            File sharing that feels fast before the transfer even starts.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Create a room, pass a short code, and move files in a calmer, more focused interface built for quick handoffs between devices.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-[1.4rem] border border-[rgba(102,72,37,0.1)] bg-white/70 p-4 shadow-[0_10px_30px_rgba(92,58,30,0.07)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{s.n}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--text)]">{s.t}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="rounded-full border border-[rgba(102,72,37,0.12)] bg-white/60 px-4 py-2">No login</span>
            <span className="rounded-full border border-[rgba(102,72,37,0.12)] bg-white/60 px-4 py-2">Room code first</span>
            <span className="rounded-full border border-[rgba(102,72,37,0.12)] bg-white/60 px-4 py-2">Direct transfer UX</span>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.84)] p-6 shadow-[0_22px_60px_rgba(92,58,30,0.1)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Start a session</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">Send files</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Create a room and hand off the code to the receiving device.</p>
            <button
              onClick={create}
              className="mt-6 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(143,62,34,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(143,62,34,0.34)]"
            >
              Create Room
            </button>
          </div>

          <div className="rounded-[2rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.84)] p-6 shadow-[0_22px_60px_rgba(92,58,30,0.1)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Join a session</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">Receive files</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Paste the six-character room code from the sender.</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && join()}
              placeholder="ABC123"
              maxLength={6}
              className="mt-6 w-full rounded-[1.2rem] border border-[rgba(102,72,37,0.15)] bg-white/80 px-4 py-4 text-center text-2xl font-semibold tracking-[0.35em] text-[var(--text)] placeholder:text-[rgba(111,99,91,0.45)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[rgba(184,92,56,0.14)]"
            />
            <button
              onClick={join}
              disabled={joinCode.length !== 6}
              className="mt-4 w-full rounded-[1.2rem] border border-[rgba(102,72,37,0.14)] bg-[var(--text)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(32,24,20,0.16)] hover:-translate-y-0.5 hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Join Room
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
