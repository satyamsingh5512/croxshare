'use client';

import React, { useState, useEffect } from 'react';
import HostPanel from '../components/nearby/HostPanel';
import JoinPanel from '../components/nearby/JoinPanel';

type Mode = 'home' | 'send' | 'receive';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('home');
  const [autoRoom, setAutoRoom] = useState<string | null>(null);

  // If URL contains ?room=xxx automatically open the receive flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setAutoRoom(room);
      setMode('receive');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-[var(--font-inter)]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Croxshare</span>
          </div>
          {mode !== 'home' && (
            <button
              onClick={() => { setMode('home'); setAutoRoom(null); }}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              &larr; Back
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        {mode === 'home' && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Share files over your local WiFi</h1>
              <p className="mt-3 text-gray-500">No login. No cloud. Files go directly device-to-device.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => setMode('send')}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Send Files</div>
                  <div className="mt-1 text-sm text-gray-500">Share a code or QR — receiver joins you</div>
                </div>
              </button>
              <button
                onClick={() => setMode('receive')}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                    <polyline points="8 12 12 16 16 12" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Receive Files</div>
                  <div className="mt-1 text-sm text-gray-500">Enter a code from the sender to connect</div>
                </div>
              </button>
            </div>

            {/* How it works */}
            <div className="mt-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">How it works</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { step: '1', title: 'Open on both devices', desc: 'Both devices must be on the same WiFi network.' },
                  { step: '2', title: 'Share the code', desc: 'Sender gets a 6-digit code — receiver enters it.' },
                  { step: '3', title: 'Verify &amp; transfer', desc: 'Match the security code and drop your files.' },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">{s.step}</div>
                    <div className="font-medium text-gray-800">{s.title}</div>
                    <div className="mt-1 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: s.desc }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'send' && <HostPanel />}
        {mode === 'receive' && <JoinPanel initialRoom={autoRoom ?? undefined} />}
      </main>
    </div>
  );
}
