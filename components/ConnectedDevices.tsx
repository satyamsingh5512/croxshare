'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Laptop2 } from 'lucide-react';
import type { DiscoveredPeer } from '@/types';

interface Props {
  peers: DiscoveredPeer[];
  onConnect: (peerId: string) => void;
}

const statusLabel: Record<DiscoveredPeer['status'], string> = {
  discovered: 'Available',
  connecting: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Disconnected',
};

export default function ConnectedDevices({ peers, onConnect }: Props) {
  if (peers.length === 0) {
    return (
      <div className="card flex flex-col items-center px-4 py-10 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
          <Laptop2 size={18} />
        </div>
        <p className="text-sm font-medium text-[var(--on-surface)]">No devices yet</p>
        <p className="mt-1 text-[13px] text-[var(--on-surface-variant)]">Share the room code to invite another device.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="label mb-2.5">Devices</p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {peers.map((peer) => (
            <motion.div
              key={peer.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={[
                'card flex items-center justify-between p-3.5 transition-shadow duration-200',
                peer.status === 'connected' ? 'ring-1 ring-[var(--ok)]/30' : 'hover:shadow-[var(--elev-2)]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--on-surface-variant)]">
                  <Laptop2 size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--on-surface)]">{peer.name}</p>
                  <p className="text-xs text-[var(--muted)]">{statusLabel[peer.status]}</p>
                </div>
              </div>

              {(peer.status === 'discovered' || peer.status === 'disconnected') && (
                <button onClick={() => onConnect(peer.id)} className="btn-tonal px-4 py-2 text-xs">
                  Connect
                </button>
              )}
              {peer.status === 'connecting' && (
                <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-medium text-[var(--primary)]">
                  <Loader2 size={13} className="animate-spin" /> Connecting
                </span>
              )}
              {peer.status === 'connected' && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ok-container)] px-3 py-1.5 text-xs font-medium text-[var(--ok)]"
                >
                  <Check size={13} /> Ready
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
