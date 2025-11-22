/**
 * File Preview Component
 * - Shows thumbnail for images/videos
 * - Displays file metadata (name, size, type)
 * - Allows removal before sending
 */

import React, { useEffect, useState } from 'react';
import { X, FileIcon, Film, Music, FileText, Archive, Code } from 'lucide-react';
import { formatFileSize, getFileCategory } from '@/lib/fileUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const category = getFileCategory(file.name);

  useEffect(() => {
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      return () => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      };
    }
  }, [file]);

  const getFileIcon = () => {
    if (category === 'video') return <Film className="h-8 w-8" />;
    if (category === 'audio') return <Music className="h-8 w-8" />;
    if (category === 'document') return <FileText className="h-8 w-8" />;
    if (category === 'archive') return <Archive className="h-8 w-8" />;
    if (category === 'code') return <Code className="h-8 w-8" />;
    return <FileIcon className="h-8 w-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Preview or Icon */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt={file.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F9FAFB] dark:bg-gray-700 text-[#4B5563] dark:text-gray-400">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#111827] dark:text-white truncate">
            {file.name}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-[#4B5563] dark:text-gray-400">
            <span>{formatFileSize(file.size)}</span>
            <span className="text-[#E5E7EB] dark:text-gray-600">•</span>
            <span className="capitalize">{category}</span>
          </div>
          {file.type && (
            <div className="mt-1 text-xs text-[#4B5563] dark:text-gray-500 truncate">
              {file.type}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface FilePreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-[#111827] dark:text-white">
        Files to send ({files.length})
      </div>
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <FilePreview
            key={`${file.name}-${file.size}-${index}`}
            file={file}
            onRemove={() => onRemove(index)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
