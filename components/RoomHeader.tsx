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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-white">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Croxshare</span>
          </Link>
          <PeerStatusBadge status={status} peerName={peerName} />
        </div>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Room</p>
        <p className="mt-1 text-3xl font-bold tracking-widest text-gray-900">{formatRoomCode(roomId)}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="flex-1 truncate text-xs text-gray-500">{shareUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
            >
              Copy
            </button>
          </div>
        </div>

        {qrDataUrl && (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-2 text-xs text-gray-400">Or scan to join on another device</p>
            <img src={qrDataUrl} alt="QR code" className="h-44 w-44 rounded-xl border border-gray-100" />
          </div>
        )}
      </div>
    </>
  );
}
