'use client';

import React from 'react';
import { useTransferStore } from '@/store/useTransferStore';
import { formatBytes } from '@/lib/utils';

export default function TransferList() {
  const items = useTransferStore((s) => s.items);
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="label-cap">Transfers</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 transition hover:border-[var(--line-bright)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">{item.name}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {item.direction === 'sending' ? '↑ Sending' : '↓ Receiving'} · {formatBytes(item.size)}
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--accent)]">
              {item.progress}%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${item.status === 'done' ? 'from-emerald-500 to-emerald-400' : 'from-violet-500 to-purple-400'}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
