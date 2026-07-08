'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, FileDown } from 'lucide-react';
import type { IncomingFile } from '@/types';
import { downloadBlob } from '@/lib/file-chunker';
import { formatBytes } from '@/lib/utils';

export default function FileReceiver({ files }: { files: IncomingFile[] }) {
  if (files.length === 0) return null;

  return (
    <div>
      <p className="label mb-2.5">Received</p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {files.map((f) => {
            const pct = f.done ? 100 : Math.min(99, Math.round((f.receivedChunks / f.meta.chunks) * 100));
            return (
              <motion.div
                key={f.meta.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary-container)] text-[var(--secondary)]">
                      <FileDown size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--on-surface)]">{f.meta.name}</p>
                      <p className="mono text-xs text-[var(--muted)]">{formatBytes(f.meta.size)}</p>
                    </div>
                  </div>
                  {f.done && f.blob ? (
                    <motion.button
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={() => downloadBlob(f.blob!, f.meta.name)}
                      className="btn-tonal shrink-0 px-4 py-2 text-xs"
                    >
                      <Download size={13} /> Save
                    </motion.button>
                  ) : (
                    <span className="mono text-xs font-medium tabular-nums text-[var(--on-surface-variant)] shrink-0">
                      {pct}%
                    </span>
                  )}
                </div>
                {!f.done ? (
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                    />
                  </div>
                ) : (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--ok)]">
                    <Check size={12} /> Transfer complete
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
