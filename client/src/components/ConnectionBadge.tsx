import React from 'react';

interface ConnectionBadgeProps {
  state: RTCPeerConnectionState;
}

const stateLabel: Record<RTCPeerConnectionState, string> = {
  new: 'Waiting',
  connecting: 'Connecting',
  connected: 'Connected',
  disconnected: 'Disconnected',
  failed: 'Disconnected',
  closed: 'Disconnected',
};

const stateClass: Record<RTCPeerConnectionState, string> = {
  new: 'bg-zinc-800 text-zinc-200 border-zinc-700',
  connecting: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  connected: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  disconnected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  failed: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  closed: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function ConnectionBadge({ state }: ConnectionBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${stateClass[state]}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {stateLabel[state]}
    </span>
  );
}
