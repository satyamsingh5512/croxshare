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
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Received files</p>
      {files.map((f) => {
        const pct = f.done
          ? 100
          : Math.min(99, Math.round((f.receivedChunks / f.meta.chunks) * 100));
        return (
          <div
            key={f.meta.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{f.meta.name}</p>
                <p className="text-xs text-gray-400">{fmt(f.meta.size)}</p>
              </div>
              {f.done && f.blob && (
                <button
                  onClick={() => downloadBlob(f.blob!, f.meta.name)}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
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
