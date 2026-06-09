'use client';

import React from 'react';
import type { DiscoveredPeer } from '@/types';

interface Props { peers: DiscoveredPeer[]; onConnect: (peerId: string) => void; }

const dot: Record<DiscoveredPeer['status'], string> = {
  discovered:   'bg-[var(--warn)]',
  connecting:   'bg-[var(--info)] animate-pulse',
  connected:    'bg-[var(--ok)]',
  disconnected: 'bg-[var(--err)]',
};

const sub: Record<DiscoveredPeer['status'], string> = {
  discovered:   'Available',
  connecting:   'Connecting…',
  connected:    'Connected',
  disconnected: 'Disconnected',
};

export default function ConnectedDevices({ peers, onConnect }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="label-cap">Devices in room</p>
        {peers.length > 0 && (
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
            {peers.length}
          </span>
        )}
      </div>

      {peers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-3)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-[var(--muted)]">
              <circle cx="12" cy="7" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">No devices yet</p>
          <p className="text-xs text-[var(--muted)]/60">Share the room code to invite others</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {peers.map((peer) => (
            <li key={peer.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-4 py-3 transition hover:border-[var(--line-bright)]">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot[peer.status]}`} />
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{peer.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">{sub[peer.status]}</p>
                </div>
              </div>

              {(peer.status === 'discovered' || peer.status === 'disconnected') && (
                <button
                  onClick={() => onConnect(peer.id)}
                  className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-4 py-1.5 text-xs font-semibold text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/25 hover:text-violet-200"
                >
                  Connect
                </button>
              )}
              {peer.status === 'connecting' && (
                <span className="text-xs font-medium text-blue-400">Connecting…</span>
              )}
              {peer.status === 'connected' && (
                <span className="text-xs font-semibold text-emerald-400">✓ Ready</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
