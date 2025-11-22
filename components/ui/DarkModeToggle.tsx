/**
 * Dark Mode Toggle Component
 * - Animated toggle switch
 * - Sun/Moon icons
 * - Smooth transitions
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function DarkModeToggle({
  isDarkMode,
  onToggle,
  className = '',
}: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
        isDarkMode
          ? 'bg-indigo-600 dark:bg-indigo-500'
          : 'bg-gray-200 dark:bg-gray-700'
      } ${className}`}
      aria-label="Toggle dark mode"
    >
      {/* Moving circle */}
      <motion.div
        animate={{
          x: isDarkMode ? 40 : 4,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-md"
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </motion.div>

      {/* Background icons */}
      <div className="flex w-full items-center justify-between px-2">
        <Sun
          className={`h-4 w-4 transition-opacity ${
            isDarkMode ? 'opacity-50' : 'opacity-100 text-yellow-600'
          }`}
        />
        <Moon
          className={`h-4 w-4 transition-opacity ${
            isDarkMode ? 'opacity-100 text-white' : 'opacity-50'
          }`}
        />
      </div>
    </button>
  );
}

interface DarkModeToggleButtonProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function DarkModeToggleButton({
  isDarkMode,
  onToggle,
}: DarkModeToggleButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="rounded-xl bg-white dark:bg-gray-800 p-2.5 shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB] dark:border-gray-700"
      aria-label="Toggle dark mode"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600" />
      )}
    </motion.button>
  );
}
