'use client';

import React from 'react';
import type { PeerStatus } from '@/types';

interface Props { status: PeerStatus; peerName: string | null; }

const cfg: Record<PeerStatus, { label: string; dot: string; border: string; text: string; bg: string }> = {
  idle:         { label: 'Idle',              dot: 'bg-[var(--muted)]',                              border: 'border-[var(--line)]',         text: 'text-[var(--muted)]',   bg: 'bg-[var(--surface-3)]' },
  waiting:      { label: 'Waiting for peer',  dot: 'bg-[var(--warn)] animate-pulse',                 border: 'border-amber-500/25',          text: 'text-amber-300',        bg: 'bg-amber-500/10' },
  connecting:   { label: 'Connecting…',       dot: 'bg-[var(--info)] animate-pulse',                 border: 'border-blue-500/25',           text: 'text-blue-300',         bg: 'bg-blue-500/10' },
  connected:    { label: 'Connected',         dot: 'bg-[var(--ok)]',                                 border: 'border-emerald-500/25',        text: 'text-emerald-300',      bg: 'bg-emerald-500/10' },
  disconnected: { label: 'Disconnected',      dot: 'bg-[var(--err)]',                                border: 'border-rose-500/25',           text: 'text-rose-300',         bg: 'bg-rose-500/10' },
  error:        { label: 'Error',             dot: 'bg-[var(--err)]',                                border: 'border-rose-500/30',           text: 'text-rose-300',         bg: 'bg-rose-500/10' },
};

export default function PeerStatus({ status, peerName }: Props) {
  const c = cfg[status];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status === 'connected' && peerName ? `${peerName} · ready` : c.label}
    </div>
  );
}
