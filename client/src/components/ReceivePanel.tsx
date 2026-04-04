import React from 'react';
import type { TransferItem } from '../context/TransferContext';
import FileQueue from './FileQueue';

interface ReceivePanelProps {
  items: TransferItem[];
}

export default function ReceivePanel({ items }: ReceivePanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 text-sm text-zinc-400">
        Waiting for files...
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-zinc-100">Received This Session</p>
      <FileQueue items={items} />
    </div>
  );
}
