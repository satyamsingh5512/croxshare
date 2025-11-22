'use client';

import { useEffect, useCallback, useState } from 'react';

interface ClipboardFile {
  file: File;
  source: 'paste' | 'drop' | 'select';
}

export function useClipboardPaste(
  onFilesReceived: (files: File[]) => void,
  enabled: boolean = true
) {
  const [lastPasteTime, setLastPasteTime] = useState(0);

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (!enabled) return;

    // Prevent duplicate pastes (sometimes fires twice)
    const now = Date.now();
    if (now - lastPasteTime < 100) return;
    setLastPasteTime(now);

    const items = event.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];

    // Extract files from clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Handle file items
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
      
      // Handle image items (screenshots, copied images)
      else if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          // Generate filename for pasted image
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const ext = item.type.split('/')[1] || 'png';
          const file = new File([blob], `pasted-image-${timestamp}.${ext}`, {
            type: item.type,
          });
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      onFilesReceived(files);
    }
  }, [enabled, lastPasteTime, onFilesReceived]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('paste', handlePaste as any);
    return () => window.removeEventListener('paste', handlePaste as any);
  }, [handlePaste, enabled]);

  return {
    isEnabled: enabled,
  };
}

// Hook for handling both drag-drop and paste
export function useFileInput(onFilesReceived: (files: File[], source: 'paste' | 'drop' | 'select') => void) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle paste
  useClipboardPaste((files) => {
    onFilesReceived(files, 'paste');
  });

  // Handle drag events
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      onFilesReceived(files, 'drop');
    }
  }, [onFilesReceived]);

  return {
    isDragging,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}

// Format file source for display
export function formatFileSource(source: 'paste' | 'drop' | 'select'): string {
  switch (source) {
    case 'paste':
      return '📋 Pasted';
    case 'drop':
      return '🎯 Dropped';
    case 'select':
      return '📁 Selected';
    default:
      return '';
  }
}
