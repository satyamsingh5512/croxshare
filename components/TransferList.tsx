'use client';

import React from 'react';
import { useTransferStore } from '@/store/useTransferStore';
import { formatBytes } from '@/lib/utils';

export default function TransferList() {
  const items = useTransferStore((state) => state.items);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Transfers</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-[1.4rem] border border-[var(--line)] bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] whitespace-nowrap">
                {item.direction === 'sending' ? 'Sending' : 'Receiving'} · {formatBytes(item.size)}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-indigo-500/20 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-[var(--accent-deep)] shadow-sm">
              {item.progress}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--teal)] transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
