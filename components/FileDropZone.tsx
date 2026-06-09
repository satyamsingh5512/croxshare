'use client';

import React, { useCallback, useRef, useState } from 'react';

interface Props { onFiles: (files: File[]) => void; disabled?: boolean; }

export default function FileDropZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    onFiles(Array.from(list));
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        'relative overflow-hidden rounded-2xl border px-6 py-12 text-center transition-all duration-200',
        dragging
          ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-900/30'
          : 'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-bright)] hover:bg-[var(--surface-3)]',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
      ].join(' ')}
    >
      {/* top glow line */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent transition-opacity duration-300 ${dragging ? 'opacity-100' : 'opacity-0'}`} />

      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-200 ${dragging ? 'border-violet-500/40 bg-violet-500/20 text-violet-300' : 'border-[var(--line)] bg-[var(--surface-3)] text-[var(--accent)]'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </div>

      <p className="mt-5 text-base font-bold tracking-tight text-[var(--text)]">
        {dragging ? 'Drop to send' : 'Drag & drop files or click to browse'}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Any file type · sent directly to the connected device
      </p>

      <input ref={inputRef} type="file" multiple className="hidden" disabled={disabled} onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
