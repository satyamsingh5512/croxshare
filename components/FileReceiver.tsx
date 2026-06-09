'use client';

import React from 'react';
import type { IncomingFile } from '@/types';
import TransferProgress from './TransferProgress';
import { downloadBlob } from '@/lib/file-chunker';

function fmt(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(1)} GB`;
}

export default function FileReceiver({ files }: { files: IncomingFile[] }) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="label-cap">Received</p>
      {files.map((f) => {
        const pct = f.done ? 100 : Math.min(99, Math.round((f.receivedChunks / f.meta.chunks) * 100));
        return (
          <div key={f.meta.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 transition hover:border-[var(--line-bright)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{f.meta.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{fmt(f.meta.size)}</p>
              </div>
              {f.done && f.blob && (
                <button
                  onClick={() => downloadBlob(f.blob!, f.meta.name)}
                  className="shrink-0 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 transition hover:border-emerald-400/40 hover:bg-emerald-500/20"
                >
                  Save
                </button>
              )}
            </div>
            {!f.done && <div className="mt-3"><TransferProgress label="Receiving" percent={pct} /></div>}
            {f.done && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Transfer complete
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
