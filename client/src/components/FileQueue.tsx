import React from 'react';
import type { TransferItem } from '../context/TransferContext';
import { formatBytes } from '../lib/utils';
import ProgressBar from './ProgressBar';

interface FileQueueProps {
  items: TransferItem[];
}

export default function FileQueue({ items }: FileQueueProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">No files queued yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{item.name}</p>
              <p className="text-xs text-zinc-400">{formatBytes(item.size)}</p>
            </div>
            <span className="rounded border border-zinc-700 px-2 py-1 text-xs uppercase text-zinc-300">
              {item.status}
            </span>
          </div>
          <ProgressBar progress={item.progress} />
          <div className="mt-2 flex justify-between text-xs text-zinc-400">
            <span>{item.speed || '0 KB/s'}</span>
            <span>ETA {item.eta || '00:00'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
