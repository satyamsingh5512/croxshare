'use client';

import React from 'react';
import type { PeerStatus } from '@/types';

interface Props {
  status: PeerStatus;
  peerName: string | null;
}

const statusConfig: Record<PeerStatus, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  idle: { label: 'Not connected', dot: 'bg-slate-400', bg: 'bg-white/80', text: 'text-slate-600', ring: 'border-[var(--line)]' },
  waiting: { label: 'Waiting for peer', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50/90', text: 'text-amber-800', ring: 'border-amber-500/20' },
  connecting: { label: 'Connecting...', dot: 'bg-sky-500 animate-pulse', bg: 'bg-sky-50/90', text: 'text-sky-800', ring: 'border-sky-500/20' },
  connected: { label: 'Connected', dot: 'bg-emerald-500', bg: 'bg-emerald-50/90', text: 'text-emerald-800', ring: 'border-emerald-500/20' },
  disconnected: { label: 'Disconnected', dot: 'bg-rose-500', bg: 'bg-rose-50/90', text: 'text-rose-800', ring: 'border-rose-500/20' },
  error: { label: 'Error', dot: 'bg-rose-600', bg: 'bg-rose-50/90', text: 'text-rose-900', ring: 'border-rose-500/30' },
};

export default function PeerStatus({ status, peerName }: Props) {
  const cfg = statusConfig[status];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md transition-all duration-300 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot} shadow-sm`} />
      {status === 'connected' && peerName ? `Connected · ${peerName}` : cfg.label}
    </div>
  );
}
