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
      {/* top bar */}
      <header className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] px-5 py-4">
        <Link href="/" className="flex items-center gap-3 opacity-90 transition hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-md shadow-violet-900/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-4 w-4">
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
              <rect x="8" y="8" width="12" height="12" rx="2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--text-2)]">Croxshare</span>
        </Link>
        <PeerStatusBadge status={status} peerName={peerName} />
      </header>

      {/* room info */}
      <div className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="label-cap">Room code</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-[var(--text)]">
            {formatRoomCode(roomId)}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Share this code or link. Other devices in the room appear below — click Connect to start a transfer.
          </p>

          <div className="mt-5 flex max-w-sm items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-3 py-2.5">
            <span className="flex-1 truncate font-mono text-xs text-[var(--muted)]">{shareUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="shrink-0 rounded-lg border border-[var(--line-bright)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-violet-500/20"
            >
              Copy
            </button>
          </div>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] p-4">
            <p className="label-cap mb-3">Scan to join</p>
            <img
              src={qrDataUrl}
              alt="QR code"
              className="h-36 w-36 rounded-xl border border-[var(--line)] bg-white p-2"
            />
          </div>
        )}
      </div>
    </>
  );
}
