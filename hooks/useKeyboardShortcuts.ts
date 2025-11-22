'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
      const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        // Prevent default behavior for recognized shortcuts
        event.preventDefault();
        shortcut.callback();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function useGlobalKeyboardShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Escape',
      callback: () => {
        // Close any open modals
        document.dispatchEvent(new CustomEvent('close-modals'));
      },
      description: 'Close modals',
    },
    {
      key: 'v',
      ctrlKey: true,
      callback: () => {
        // Trigger paste
        document.dispatchEvent(new CustomEvent('paste-files'));
      },
      description: 'Paste files',
    },
    {
      key: 'h',
      ctrlKey: true,
      callback: () => {
        // Show history
        document.dispatchEvent(new CustomEvent('show-history'));
      },
      description: 'Show transfer history',
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => {
        // Start send
        document.dispatchEvent(new CustomEvent('start-send'));
      },
      description: 'Send files',
    },
    {
      key: ' ',
      callback: () => {
        // Pause/Resume
        document.dispatchEvent(new CustomEvent('toggle-pause'));
      },
      description: 'Pause/Resume transfer',
    },
    {
      key: 'Delete',
      callback: () => {
        // Delete selected
        document.dispatchEvent(new CustomEvent('delete-selected'));
      },
      description: 'Remove selected files',
    },
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
}
