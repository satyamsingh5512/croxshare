/**
 * Speed Limit Selector Component
 * - Dropdown for selecting transfer speed limits
 * - Visual speed indicators
 */

import React from 'react';
import { Gauge } from 'lucide-react';
import { SpeedLimit, SPEED_LIMITS } from '@/hooks/useTransferSpeedLimiter';
import { motion } from 'framer-motion';

interface SpeedLimitSelectorProps {
  currentLimit: SpeedLimit;
  onChange: (limit: SpeedLimit) => void;
  disabled?: boolean;
}

export function SpeedLimitSelector({
  currentLimit,
  onChange,
  disabled = false,
}: SpeedLimitSelectorProps) {
  const currentConfig = SPEED_LIMITS[currentLimit];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white">
        <Gauge className="h-4 w-4" />
        <span>Transfer Speed Limit</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(SPEED_LIMITS).map(([key, config]) => {
          const isSelected = currentLimit === key;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onChange(key as SpeedLimit)}
              disabled={disabled}
              className={`relative rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-[#4F46E5] text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-gray-700 hover:border-[#4F46E5] dark:hover:border-indigo-500'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {config.label}
            </motion.button>
          );
        })}
      </div>

      {currentConfig.bytesPerSecond && (
        <p className="text-xs text-[#4B5563] dark:text-gray-400 mt-2">
          Current limit: {currentConfig.label} ({(currentConfig.bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s)
        </p>
      )}
    </div>
  );
}

interface SpeedLimitBadgeProps {
  limit: SpeedLimit;
}

export function SpeedLimitBadge({ limit }: SpeedLimitBadgeProps) {
  const config = SPEED_LIMITS[limit];

  if (limit === 'unlimited') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
        <Gauge className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
      <Gauge className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}
