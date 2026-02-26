'use client';

import React from 'react';
import type { PeerStatus } from '@/types';

interface Props {
  status: PeerStatus;
  peerName: string | null;
}

const statusConfig: Record<PeerStatus, { label: string; dot: string; bg: string; text: string }> = {
  idle:         { label: 'Not connected',   dot: 'bg-gray-400',            bg: 'bg-gray-50',   text: 'text-gray-600' },
  waiting:      { label: 'Waiting for peer', dot: 'bg-yellow-400 animate-pulse', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  connecting:   { label: 'Connecting…',     dot: 'bg-blue-400 animate-pulse',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  connected:    { label: 'Connected',        dot: 'bg-green-500',           bg: 'bg-green-50',  text: 'text-green-700' },
  disconnected: { label: 'Disconnected',     dot: 'bg-red-400',             bg: 'bg-red-50',    text: 'text-red-700' },
  error:        { label: 'Error',            dot: 'bg-red-500',             bg: 'bg-red-50',    text: 'text-red-700' },
};

export default function PeerStatus({ status, peerName }: Props) {
  const cfg = statusConfig[status];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {status === 'connected' && peerName ? `Connected · ${peerName}` : cfg.label}
    </div>
  );
}
