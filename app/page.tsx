'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode, normalizeRoomCode } from '@/lib/utils';

const features = [
  { n: '01', t: 'Create a room', d: 'One tap opens a private room with a short code. Nothing persists after you leave.' },
  { n: '02', t: 'Share the code', d: 'Hand the 6-character code to the other device. No accounts, no friction.' },
  { n: '03', t: 'Files move direct', d: 'WebRTC DataChannel — browser to browser. No relay server touches your files.' },
];

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  function create() { router.push(`/room/${generateRoomCode()}`); }
  function join() {
    const code = normalizeRoomCode(joinCode);
    if (code.length === 6) router.push(`/room/${code}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* ambient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-purple-900/30 blur-[140px]" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">

        {/* ── left: hero ── */}
        <section className="relative">
          {/* logo wordmark */}
          <div className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-900/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-5 w-5">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide text-[var(--text-2)]">Croxshare</span>
          </div>

          <h1 className="max-w-xl text-[3.5rem] font-bold leading-[1.0] tracking-[-0.04em] text-[var(--text)] sm:text-6xl lg:text-7xl">
            Move files.<br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Zero friction.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-[1.05rem]">
            Create a room, pass a short code, and transfer files directly between browsers — no cloud, no login, no size limits.
          </p>

          {/* feature steps */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.n} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-5 transition hover:border-[var(--line-bright)] hover:bg-[var(--surface-3)]">
                <p className="label-cap text-violet-500">{f.n}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--text)]">{f.t}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{f.d}</p>
              </div>
            ))}
          </div>

          {/* pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['WebRTC P2P', 'No login', 'Any file type', 'LAN-first'].map((t) => (
              <span key={t} className="rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── right: action cards ── */}
        <section className="space-y-4">
          {/* create */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-7">
            <p className="label-cap">New session</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)]">Send files</h2>
            <p className="mt-1.5 text-sm text-[var(--muted)]">Open a room and share the code with the other device.</p>
            <button onClick={create} className="btn-primary mt-6 w-full py-4">
              Create Room →
            </button>
          </div>

          {/* join */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-7">
            <p className="label-cap">Join session</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)]">Receive files</h2>
            <p className="mt-1.5 text-sm text-[var(--muted)]">Enter the 6-character code from the sender.</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && join()}
              placeholder="ABC123"
              maxLength={6}
              className="mt-6 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--line-focus)] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              onClick={join}
              disabled={joinCode.length !== 6}
              className="btn-ghost mt-3 w-full py-4"
            >
              Join Room
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
