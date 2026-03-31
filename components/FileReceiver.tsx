'use client';

import React from 'react';
import type { IncomingFile } from '@/types';
import TransferProgress from './TransferProgress';
import { downloadBlob } from '@/lib/file-chunker';

interface Props {
  files: IncomingFile[];
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export default function FileReceiver({ files }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Received files</p>
      {files.map((f) => {
        const pct = f.done ? 100 : Math.min(99, Math.round((f.receivedChunks / f.meta.chunks) * 100));
        return (
          <div
            key={f.meta.id}
            className="rounded-[1.4rem] border border-[rgba(102,72,37,0.1)] bg-[rgba(255,252,247,0.86)] p-4 shadow-[0_18px_46px_rgba(92,58,30,0.08)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{f.meta.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{fmt(f.meta.size)}</p>
              </div>
              {f.done && f.blob && (
                <button
                  onClick={() => downloadBlob(f.blob, f.meta.name)}
                  className="shrink-0 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] px-4 py-2 text-xs font-semibold text-white shadow-[0_14px_26px_rgba(143,62,34,0.26)] hover:-translate-y-0.5"
                >
                  Save
                </button>
              )}
            </div>
            {!f.done && <TransferProgress label="Receiving" percent={pct} />}
          </div>
        );
      })}
    </div>
  );
}
