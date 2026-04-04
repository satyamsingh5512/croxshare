'use client';

import React, { useCallback, useRef, useState } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileDropZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative overflow-hidden rounded-[1.9rem] border px-6 py-12 text-center shadow-xl transition-all duration-300
        ${dragging ? 'border-indigo-400 bg-indigo-50/90 shadow-indigo-500/10' : 'border-[var(--line)] bg-white/80 shadow-slate-200/50 backdrop-blur-md hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/95 hover:shadow-2xl hover:shadow-indigo-500/10'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent opacity-80" />
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/60 shadow-lg transition-colors duration-300 ${dragging ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-indigo-500/30' : 'bg-white text-[var(--accent)] shadow-slate-200/50'}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8"
        >
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </div>
      <p className="mt-5 text-xl font-bold tracking-tight text-[var(--text)]">
        {dragging ? 'Drop files here' : 'Drag and drop files or click to browse'}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        Smooth handoff for documents, media, archives, and anything else you need to move quickly.
      </p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        Any file type · room-based transfer
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}
