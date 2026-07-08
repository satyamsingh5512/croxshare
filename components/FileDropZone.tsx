'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileUp } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileDropZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback((list: FileList | null) => {
    if (list?.length) onFiles(Array.from(list));
  }, [onFiles]);

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      onClick={() => !disabled && inputRef.current?.click()}
      animate={dragging ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click(); }}
      className={[
        'flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200',
        dragging
          ? 'border-[var(--primary)] bg-[var(--primary-container)]/50'
          : 'border-[var(--outline)] bg-[var(--surface)]',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--surface-1)]',
      ].join(' ')}
    >
      <motion.div
        animate={dragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={[
          'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200',
          dragging ? 'bg-[var(--primary)] text-white' : 'bg-[var(--primary-container)] text-[var(--primary)]',
        ].join(' ')}
      >
        {dragging ? <FileUp size={22} /> : <UploadCloud size={22} />}
      </motion.div>
      <div>
        <p className="text-sm font-semibold text-[var(--on-surface)]">
          {dragging ? 'Drop to send' : 'Drag files here, or click to browse'}
        </p>
        <p className="mt-1 text-[13px] text-[var(--on-surface-variant)]">Sent directly to the connected device</p>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" disabled={disabled} onChange={(e) => handle(e.target.files)} />
    </motion.div>
  );
}
