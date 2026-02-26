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
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition
        ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'}
        ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <svg
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="mb-3 h-10 w-10 text-gray-400"
      >
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      <p className="text-sm font-medium text-gray-700">
        {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
      </p>
      <p className="mt-1 text-xs text-gray-400">Any file type · no size limit</p>
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
