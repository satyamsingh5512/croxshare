import { useState, useCallback } from 'react';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface UseNativeShareReturn {
  isSupported: boolean;
  canShareFiles: boolean;
  share: (data: ShareData) => Promise<void>;
  isSharing: boolean;
  error: string | null;
}

/**
 * Hook for native share functionality with fallback
 * Detects Web Share API support and file sharing capability
 */
export function useNativeShare(): UseNativeShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Web Share API is supported
  const isSupported = typeof navigator !== 'undefined' && 'share' in navigator;
  
  // Check if sharing files is supported
  const canShareFiles = isSupported && navigator.canShare !== undefined;

  const share = useCallback(async (data: ShareData) => {
    setError(null);
    setIsSharing(true);

    try {
      // Validate if browser supports Web Share API
      if (!isSupported) {
        throw new Error('Web Share API is not supported in this browser');
      }

      // Prepare share data
      const shareData: ShareData = {
        title: data.title,
        text: data.text,
        url: data.url,
      };

      // Add files if supported and provided
      if (data.files && data.files.length > 0) {
        if (canShareFiles && navigator.canShare({ files: data.files })) {
          shareData.files = data.files;
        } else {
          throw new Error('File sharing is not supported in this browser');
        }
      }

      // Trigger native share sheet
      await navigator.share(shareData);
      
      // Share was successful or user dismissed
    } catch (err: any) {
      // User cancelled the share
      if (err.name === 'AbortError') {
        console.log('Share cancelled by user');
      } else {
        console.error('Share failed:', err);
        setError(err.message || 'Failed to share');
        throw err;
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSupported, canShareFiles]);

  return {
    isSupported,
    canShareFiles,
    share,
    isSharing,
    error,
  };
}

/**
 * Hook for handling shared files received via Web Share Target API
 * Note: Requires service worker and manifest configuration
 */
export function useShareTarget() {
  const [sharedFiles, setSharedFiles] = useState<File[]>([]);

  const handleSharedFiles = useCallback((files: File[]) => {
    setSharedFiles(files);
  }, []);

  const clearSharedFiles = useCallback(() => {
    setSharedFiles([]);
  }, []);

  return {
    sharedFiles,
    handleSharedFiles,
    clearSharedFiles,
  };
}
