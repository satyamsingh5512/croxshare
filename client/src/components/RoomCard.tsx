import React from 'react';
import ConnectionBadge from './ConnectionBadge';
import QRDisplay from './QRDisplay';

interface RoomCardProps {
  roomId: string;
  peerCount: number;
  connectionState: RTCPeerConnectionState;
}

export default function RoomCard({ roomId, peerCount, connectionState }: RoomCardProps) {
  async function copyRoom(): Promise<void> {
    await navigator.clipboard.writeText(roomId);
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 md:grid-cols-[1fr_auto]">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-400">Transfer Room</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-zinc-100">{roomId}</h2>
          <button
            type="button"
            onClick={() => void copyRoom()}
            className="rounded-lg border border-violet-500/40 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/10"
          >
            Copy
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ConnectionBadge state={connectionState} />
          <span className="text-sm text-zinc-300">Peers: {peerCount}</span>
        </div>
      </div>
      <QRDisplay roomId={roomId} />
    </section>
  );
}
