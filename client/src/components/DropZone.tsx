import React, { useRef, useState } from 'react';

interface DropZoneProps {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export default function DropZone({ disabled, onFiles }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pushFiles(list: FileList | null): void {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        pushFiles(event.dataTransfer.files);
      }}
      onClick={() => {
        if (disabled) return;
        inputRef.current?.click();
      }}
      className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition ${
        dragging ? 'border-violet-400 bg-violet-500/10' : 'border-zinc-700 bg-zinc-900/70'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <p className="text-sm font-medium text-zinc-100">Drag and drop files here</p>
      <p className="mt-2 text-xs text-zinc-400">or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(event) => pushFiles(event.target.files)}
      />
    </div>
  );
}
