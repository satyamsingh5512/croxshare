'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { useNativeShare } from '@/hooks/useNativeShare';

interface MobileShareSheetProps {
  files: File[];
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Mobile Share Sheet - Native share dialog for mobile devices
 * Falls back to custom UI on desktop
 */
export function MobileShareSheet({ files, onClose, isOpen }: MobileShareSheetProps) {
  const { isSupported, canShareFiles, share, isSharing, error } = useNativeShare();

  const handleShare = async () => {
    if (files.length === 0) {
      return;
    }

    try {
      await share({
        title: 'Share Files via Nebay Pro',
        text: `Sharing ${files.length} file${files.length > 1 ? 's' : ''} from Nebay Pro`,
        files: files,
      });
      onClose();
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleShareLink = async () => {
    try {
      await share({
        title: 'Nebay Pro - P2P File Sharing',
        text: 'Share files securely with P2P encryption',
        url: window.location.href,
      });
      onClose();
    } catch (err) {
      console.error('Share link failed:', err);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Share Files
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {files.length} file{files.length > 1 ? 's' : ''} • {formatSize(totalSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[calc(80vh-180px)] overflow-y-auto">
                {/* Device Detection */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  {isSupported ? (
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isSupported ? 'Mobile Device Detected' : 'Desktop Browser'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {isSupported
                        ? canShareFiles
                          ? 'File sharing is supported'
                          : 'Link sharing only'
                        : 'Use P2P transfer instead'}
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* File List Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Files to share:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {file.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatSize(file.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Actions */}
                <div className="space-y-3 pt-4">
                  {isSupported && canShareFiles && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      disabled={isSharing || files.length === 0}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      {isSharing ? 'Sharing...' : 'Share Files via Native Sheet'}
                    </motion.button>
                  )}

                  {isSupported && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShareLink}
                      disabled={isSharing}
                      className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Link to Nebay Pro
                    </motion.button>
                  )}

                  {!isSupported && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Native sharing is not supported on this browser.
                        <br />
                        Use the P2P transfer feature above instead.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact Share Button for triggering the sheet
 */
export function ShareButton({ files, className = '' }: { files: File[]; className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isSupported } = useNativeShare();

  if (!isSupported || files.length === 0) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all ${className}`}
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>

      <MobileShareSheet files={files} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
