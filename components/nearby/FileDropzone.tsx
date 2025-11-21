import React, { useCallback, useRef } from 'react';

export default function FileDropzone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  }, [onFile]);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-6 text-center shadow-sm shadow-slate-300/20 cursor-pointer"
      >
        <p className="text-sm text-[#4B5563]">Drag & drop files here or click to browse</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
