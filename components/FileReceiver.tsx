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
            className="rounded-[1.4rem] border border-[var(--line)] bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{f.meta.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{fmt(f.meta.size)}</p>
              </div>
              {f.done && f.blob && (
                <button
                  onClick={() => downloadBlob(f.blob, f.meta.name)}
                  className="shrink-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  Save
                </button>
              )}
            </div>
            {!f.done && <div className="mt-3"><TransferProgress label="Receiving" percent={pct} /></div>}
          </div>
        );
      })}
    </div>
  );
}
