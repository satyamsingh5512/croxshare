'use client';

import React from 'react';
import Link from 'next/link';
import type { PeerStatus } from '@/types';
import PeerStatusBadge from '@/components/PeerStatus';
import { formatRoomCode } from '@/lib/utils';

interface RoomHeaderProps {
  roomId: string;
  shareUrl: string;
  status: PeerStatus;
  peerName: string | null;
  qrDataUrl?: string;
}

export default function RoomHeader({ roomId, shareUrl, status, peerName, qrDataUrl }: RoomHeaderProps) {
  return (
    <>
      <header className="rounded-[1.7rem] border border-[var(--line)] bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-lg shadow-indigo-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Croxshare room</p>
              <span className="text-lg font-semibold tracking-tight text-[var(--text)]">Ready to transfer</span>
            </div>
          </Link>
          <PeerStatusBadge status={status} peerName={peerName} />
        </div>
      </header>

      <div className="grid gap-4 rounded-[1.8rem] border border-[var(--line)] bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Room code</p>
          <p className="mt-2 text-4xl font-bold tracking-[0.28em] text-[var(--text)]">{formatRoomCode(roomId)}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Share this room link or scan the code from the receiving device to start the handshake.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white/80 px-3 py-3 shadow-inner">
              <span className="flex-1 truncate text-xs font-medium text-[var(--muted)]">{shareUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="shrink-0 rounded-full border border-indigo-500/20 bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-deep)] shadow-sm transition hover:-translate-y-0.5 hover:shadow hover:bg-indigo-100"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[var(--line)] bg-slate-50/50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Scan to join</p>
            <img src={qrDataUrl} alt="QR code" className="h-44 w-44 rounded-[1.2rem] border border-slate-200 bg-white p-2 shadow-lg shadow-slate-300/30" />
          </div>
        )}
      </div>
    </>
  );
}
