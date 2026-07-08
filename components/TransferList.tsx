'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useTransferStore } from '@/store/useTransferStore';
import { formatBytes } from '@/lib/utils';

export default function TransferList() {
  const items = useTransferStore((s) => s.items);
  if (items.length === 0) return null;

  return (
    <div>
      <p className="label mb-2.5">Transfers</p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      item.direction === 'sending'
                        ? 'bg-[var(--primary-container)] text-[var(--primary)]'
                        : 'bg-[var(--secondary-container)] text-[var(--secondary)]',
                    ].join(' ')}
                  >
                    {item.direction === 'sending' ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--on-surface)]">{item.name}</p>
                    <p className="mono text-xs text-[var(--muted)]">{formatBytes(item.size)}</p>
                  </div>
                </div>
                {item.status === 'done' ? (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--ok-container)] px-2.5 py-1 text-xs font-medium text-[var(--ok)] shrink-0"
                  >
                    <Check size={12} /> Done
                  </motion.span>
                ) : (
                  <span className="mono text-xs font-medium tabular-nums text-[var(--on-surface-variant)] shrink-0">
                    {item.progress}%
                  </span>
                )}
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={[
                    'h-full rounded-full',
                    item.status === 'done'
                      ? 'bg-[var(--ok)]'
                      : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
                  ].join(' ')}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
