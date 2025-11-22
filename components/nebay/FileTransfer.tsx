'use client';

import React, { useState, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isDisabled?: boolean;
}

export function DropZone({ onFilesSelected, isDisabled = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isDisabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? 'border-primary bg-primary/10 shadow-glow scale-[1.02]'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-card/50'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
    >
      <label className={`block p-12 ${isDisabled ? '' : 'cursor-pointer'}`}>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          disabled={isDisabled}
          className="hidden"
        />

        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.div
            animate={
              isDragging
                ? {
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isDragging
                ? 'bg-gradient-to-br from-primary to-accent shadow-glow'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
            }`}
          >
            <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
          </motion.div>

          <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Any file type • Up to 2GB per file
          </p>
        </motion.div>

        {/* Animated glow effect */}
        {isDragging && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl pointer-events-none"
          />
        )}
      </label>
    </div>
  );
}

interface FileCardProps {
  file: {
    name: string;
    size: number;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
  };
  onRemove?: () => void;
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const statusConfig = {
    pending: {
      icon: FileIcon,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    uploading: {
      icon: Upload,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  };

  const config = statusConfig[file.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      className={`rounded-2xl p-4 ${config.bgColor} backdrop-blur-xl border border-gray-200 dark:border-gray-700 transition-all`}
    >
      <div className="flex items-center gap-4">
        {/* File icon */}
        <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <StatusIcon className={`w-6 h-6 ${config.color} ${file.status === 'uploading' ? 'animate-pulse' : ''}`} />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-light dark:text-text-dark truncate">
            {file.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
            {file.progress !== undefined && file.status === 'uploading' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-primary">{file.progress}%</p>
              </>
            )}
            {file.status === 'completed' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
              </>
            )}
            {file.status === 'error' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
              </>
            )}
          </div>

          {/* Progress bar */}
          {file.progress !== undefined && file.status === 'uploading' && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              className="mt-2 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
            />
          )}
        </div>

        {/* Remove button */}
        {onRemove && file.status !== 'uploading' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-600" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
  }>;
  onRemove?: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onRemove={onRemove ? () => onRemove(file.id) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
