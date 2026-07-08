'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Copy } from 'lucide-react';

interface Props {
  roomId: string;
  shareUrl: string;
  peerCount: number;
  connectedCount: number;
}

export default function RoomHeader({ roomId, shareUrl, peerCount, connectedCount }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const statusText =
    connectedCount > 0 ? `${connectedCount} connected` : peerCount > 0 ? `${peerCount} in room` : 'Waiting for peers';

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/" className="btn-text -ml-3">
          <ArrowLeft size={15} />
          croxshare
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-1)] px-3 py-1.5 text-xs font-medium text-[var(--on-surface-variant)]">
          {connectedCount > 0 && (
            <span className="relative flex h-2 w-2 text-[var(--ok)]">
              <span className="dot-pulse absolute inline-flex h-full w-full rounded-full" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ok)]" />
            </span>
          )}
          {statusText}
        </span>
      </div>

      <div className="card-elevated mt-4 flex items-center justify-between gap-4 px-5 py-5">
        <div className="min-w-0">
          <p className="label">Room code</p>
          <p className="text-gradient mono mt-1 text-4xl font-bold tracking-[0.15em]">{roomId.toUpperCase()}</p>
          <p className="mono mt-2 truncate text-xs text-[var(--muted)]">{shareUrl}</p>
        </div>
        <button onClick={copy} className="btn-tonal shrink-0 px-4 py-2.5 text-xs">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                className="inline-flex items-center gap-1.5"
              >
                <Check size={13} /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                className="inline-flex items-center gap-1.5"
              >
                <Copy size={13} /> Copy link
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
