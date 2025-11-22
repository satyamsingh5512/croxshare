'use client';

import React, { useState, DragEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { getFileIcon, formatFileSize, formatTransferSpeed, formatTimeRemaining, getFileColor } from '@/lib/fileUtils';

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
    speed?: number;
    startTime?: number;
  };
  onRemove?: () => void;
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('Calculating...');

  useEffect(() => {
    if (file.status === 'uploading' && file.progress && file.speed && file.startTime) {
      const remainingBytes = file.size * (1 - file.progress / 100);
      const secondsRemaining = remainingBytes / file.speed;
      setTimeRemaining(formatTimeRemaining(secondsRemaining));
    }
  }, [file.progress, file.speed, file.size, file.status, file.startTime]);

  const statusConfig = {
    pending: {
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
    uploading: {
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
    completed: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    error: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  };

  const config = statusConfig[file.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      className={`rounded-2xl p-4 ${config.bgColor} backdrop-blur-xl border ${config.borderColor} transition-all`}
    >
      <div className="flex items-start gap-4">
        {/* File icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(file.name)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <div className="text-white">
            {getFileIcon(file.name, 24)}
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-light dark:text-text-dark truncate">
            {file.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
            
            {file.status === 'uploading' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-primary font-medium">{file.progress}%</p>
                
                {file.speed && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <p className="text-xs text-primary">{formatTransferSpeed(file.speed)}</p>
                    </div>
                  </>
                )}
                
                {timeRemaining && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{timeRemaining}</p>
                    </div>
                  </>
                )}
              </>
            )}
            
            {file.status === 'completed' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Completed</p>
                </div>
              </>
            )}
            
            {file.status === 'error' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Failed</p>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          {file.progress !== undefined && file.status === 'uploading' && (
            <div className="mt-2">
              <motion.div
                className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                >
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Remove/Status button */}
        {file.status === 'completed' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0"
          >
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </motion.div>
        ) : file.status === 'error' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </motion.div>
        ) : onRemove && file.status !== 'uploading' ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-600" />
          </motion.button>
        ) : null}
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
    speed?: number;
    startTime?: number;
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
