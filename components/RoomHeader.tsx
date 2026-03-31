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
      <header className="rounded-[1.7rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,250,242,0.78)] shadow-[0_20px_60px_rgba(92,58,30,0.1)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Croxshare room</p>
              <span className="text-lg font-semibold tracking-[-0.03em] text-[var(--text)]">Ready to transfer</span>
            </div>
          </Link>
          <PeerStatusBadge status={status} peerName={peerName} />
        </div>
      </header>

      <div className="grid gap-4 rounded-[1.8rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.84)] p-6 shadow-[0_22px_60px_rgba(92,58,30,0.1)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Room code</p>
          <p className="mt-2 text-4xl font-semibold tracking-[0.28em] text-[var(--text)]">{formatRoomCode(roomId)}</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
            Share this room link or scan the code from the receiving device to start the handshake.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-[1rem] border border-[rgba(102,72,37,0.12)] bg-white/75 px-3 py-3">
              <span className="flex-1 truncate text-xs text-[var(--muted)]">{shareUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="shrink-0 rounded-full border border-[rgba(184,92,56,0.18)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-deep)] hover:-translate-y-0.5"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(102,72,37,0.1)] bg-white/65 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Scan to join</p>
            <img src={qrDataUrl} alt="QR code" className="h-44 w-44 rounded-[1.2rem] border border-[rgba(102,72,37,0.08)] bg-white p-2 shadow-[0_14px_40px_rgba(92,58,30,0.08)]" />
          </div>
        )}
      </div>
    </>
  );
}
