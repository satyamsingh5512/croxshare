'use client';

import React from 'react';
import type { PeerStatus } from '@/types';

interface Props {
  status: PeerStatus;
  peerName: string | null;
}

const statusConfig: Record<PeerStatus, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  idle: { label: 'Not connected', dot: 'bg-slate-400', bg: 'bg-white/70', text: 'text-slate-600', ring: 'border-[rgba(102,72,37,0.12)]' },
  waiting: { label: 'Waiting for peer', dot: 'bg-amber-500 animate-pulse', bg: 'bg-[rgba(252,235,197,0.75)]', text: 'text-amber-800', ring: 'border-[rgba(217,119,6,0.18)]' },
  connecting: { label: 'Connecting...', dot: 'bg-sky-500 animate-pulse', bg: 'bg-[rgba(210,235,247,0.78)]', text: 'text-sky-800', ring: 'border-[rgba(14,116,144,0.18)]' },
  connected: { label: 'Connected', dot: 'bg-emerald-500', bg: 'bg-[rgba(214,244,229,0.82)]', text: 'text-emerald-800', ring: 'border-[rgba(5,150,105,0.18)]' },
  disconnected: { label: 'Disconnected', dot: 'bg-rose-500', bg: 'bg-[rgba(255,228,230,0.8)]', text: 'text-rose-800', ring: 'border-[rgba(225,29,72,0.16)]' },
  error: { label: 'Error', dot: 'bg-rose-600', bg: 'bg-[rgba(255,228,230,0.84)]', text: 'text-rose-900', ring: 'border-[rgba(225,29,72,0.18)]' },
};

export default function PeerStatus({ status, peerName }: Props) {
  const cfg = statusConfig[status];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {status === 'connected' && peerName ? `Connected · ${peerName}` : cfg.label}
    </div>
  );
}
