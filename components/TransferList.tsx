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
        <div key={item.id} className="rounded-[1.4rem] border border-[rgba(102,72,37,0.1)] bg-[rgba(255,252,247,0.86)] p-4 shadow-[0_18px_46px_rgba(92,58,30,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.direction === 'sending' ? 'Sending' : 'Receiving'} · {formatBytes(item.size)}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[rgba(102,72,37,0.12)] bg-white/75 px-2.5 py-1 text-xs font-semibold text-[var(--accent-deep)]">
              {item.progress}%
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(102,72,37,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--teal))] transition-all duration-200"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
