'use client';

import React from 'react';
import type { DiscoveredPeer } from '@/types';

interface Props {
  peers: DiscoveredPeer[];
  onConnect: (peerId: string) => void;
}

const statusDot: Record<DiscoveredPeer['status'], string> = {
  discovered: 'bg-amber-400',
  connecting: 'bg-sky-400 animate-pulse',
  connected: 'bg-emerald-400',
  disconnected: 'bg-rose-400',
};

const statusLabel: Record<DiscoveredPeer['status'], string> = {
  discovered: 'Available',
  connecting: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Disconnected',
};

export default function ConnectedDevices({ peers, onConnect }: Props) {
  if (peers.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-5 py-5 text-center shadow-sm backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Devices in room</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Waiting for others to join…</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-5 py-5 shadow-sm backdrop-blur-md">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        Devices in room
      </p>
      <ul className="space-y-2">
        {peers.map((peer) => (
          <li
            key={peer.id}
            className="flex items-center justify-between rounded-[1rem] border border-[var(--line)] bg-white/90 px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${statusDot[peer.status]}`} />
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{peer.name}</p>
                <p className="text-[11px] text-[var(--muted)]">{statusLabel[peer.status]}</p>
              </div>
            </div>
            {(peer.status === 'discovered' || peer.status === 'disconnected') && (
              <button
                onClick={() => onConnect(peer.id)}
                className="rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0"
              >
                Connect
              </button>
            )}
            {peer.status === 'connecting' && (
              <span className="text-xs font-medium text-sky-600">Connecting…</span>
            )}
            {peer.status === 'connected' && (
              <span className="text-xs font-medium text-emerald-600">✓ Ready</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
