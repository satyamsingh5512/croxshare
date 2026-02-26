'use client';

import React from 'react';
import { useTransferStore } from '@/store/useTransferStore';
import { formatBytes } from '@/lib/utils';

export default function TransferList() {
  const items = useTransferStore((state) => state.items);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transfers</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-400">
                {item.direction === 'sending' ? 'Sending' : 'Receiving'} · {formatBytes(item.size)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-gray-500">{item.progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-200"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
