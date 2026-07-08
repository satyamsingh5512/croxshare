'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Laptop2, Check } from 'lucide-react';
import type { DiscoveredPeer } from '@/types';

interface Props {
  peer: DiscoveredPeer | undefined;
  myName: string;
}

const STATUS_COPY: Record<DiscoveredPeer['status'], string> = {
  discovered: 'Found — not linked yet',
  connecting: 'Negotiating handshake…',
  connected: 'Direct channel open',
  disconnected: 'Link dropped',
};

/**
 * Signature element: a live trace between two devices that mirrors the real
 * RTCPeerConnection state machine (discovered → connecting → connected).
 * The sweep travels the wire only while ICE/SDP exchange is truly in flight,
 * and resolves solid the instant the DataChannel actually opens.
 */
export default function ConnectionTrace({ peer, myName }: Props) {
  const status = peer?.status ?? 'discovered';
  const active = !!peer;
  const connecting = status === 'connecting';
  const connected = status === 'connected';

  return (
    <div className="card-elevated px-5 py-6">
      <div className="flex items-center justify-between gap-3">
        <Endpoint label={myName || 'You'} online />

        <div className="relative flex-1 min-w-[64px] overflow-hidden">
          <svg viewBox="0 0 100 10" className="w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wire-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1="0" y1="5" x2="100" y2="5" stroke="var(--outline-variant)" strokeWidth="2" strokeLinecap="round" />

            <motion.line
              x1="0" y1="5" x2="100" y2="5"
              stroke={connected ? 'var(--ok)' : 'var(--primary)'}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
              transition={{ duration: connected ? 0.5 : 0.9, ease: 'easeInOut' }}
            />

            {connecting && (
              <rect x="-15" y="0" width="15" height="10" fill="url(#wire-sweep)">
                <animate attributeName="x" from="-15" to="100" dur="1.1s" repeatCount="indefinite" />
              </rect>
            )}
          </svg>

          <AnimatePresence>
            {connected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ok)] p-1 text-white shadow-[var(--elev-2)]"
              >
                <Check size={11} strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Endpoint label={peer?.name ?? 'Waiting…'} online={active} />
      </div>

      <p
        className={[
          'mt-4 text-center text-[13px] font-medium',
          connected ? 'text-[var(--ok)]' : connecting ? 'text-[var(--primary)]' : 'text-[var(--muted)]',
        ].join(' ')}
      >
        {peer ? STATUS_COPY[status] : 'Waiting for a device to join'}
      </p>
    </div>
  );
}

function Endpoint({ label, online }: { label: string; online: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className={[
          'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300',
          online
            ? 'bg-[var(--primary-container)] text-[var(--primary)] shadow-[var(--elev-1)]'
            : 'bg-[var(--surface-2)] text-[var(--muted)]',
        ].join(' ')}
      >
        <Laptop2 size={18} />
      </div>
      <span className="max-w-[80px] truncate text-xs font-medium text-[var(--on-surface-variant)]">{label}</span>
    </div>
  );
}
