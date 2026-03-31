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
      className={`relative overflow-hidden rounded-[1.9rem] border px-6 py-12 text-center shadow-[0_22px_60px_rgba(92,58,30,0.1)] transition
        ${dragging ? 'border-[rgba(184,92,56,0.34)] bg-[rgba(240,223,211,0.9)]' : 'border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.86)] hover:-translate-y-1 hover:border-[rgba(184,92,56,0.22)] hover:bg-white/90'}
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/60 shadow-lg ${dragging ? 'bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-white' : 'bg-white/90 text-[var(--accent)]'}`}>
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
      <p className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">
        {dragging ? 'Drop files here' : 'Drag and drop files or click to browse'}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
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
