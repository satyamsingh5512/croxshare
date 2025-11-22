/**
 * useDarkMode Hook
 * - Manages dark mode state with localStorage persistence
 * - Applies theme to document root
 * - Smooth transitions between themes
 */

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('nebay:darkMode');
    if (stored !== null) {
      setIsDarkMode(stored === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('nebay:darkMode', String(isDarkMode));
  }, [isDarkMode, mounted]);

  const toggle = () => setIsDarkMode(!isDarkMode);

  return {
    isDarkMode,
    toggle,
    mounted,
  };
}
