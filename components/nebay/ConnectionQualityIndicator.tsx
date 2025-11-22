/**
 * Connection Quality Indicator Component
 * - Visual indicator for connection quality
 * - Shows RTT and bandwidth
 * - Color-coded status
 */

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ConnectionQuality,
  formatBandwidth,
  getQualityColor,
  getQualityLabel,
} from '@/hooks/useConnectionQuality';

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQuality;
  rtt: number | null;
  bandwidth: number | null;
  className?: string;
}

export function ConnectionQualityIndicator({
  quality,
  rtt,
  bandwidth,
  className = '',
}: ConnectionQualityIndicatorProps) {
  const qualityColor = getQualityColor(quality);
  const qualityLabel = getQualityLabel(quality);

  const getSignalBars = () => {
    switch (quality) {
      case 'excellent':
        return 4;
      case 'good':
        return 3;
      case 'fair':
        return 2;
      case 'poor':
        return 1;
      default:
        return 0;
    }
  };

  const bars = getSignalBars();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Signal Strength Visualization */}
      <div className="flex items-end gap-0.5 h-5">
        {[1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: bar <= bars ? 1 : 0.2,
              scaleY: bar <= bars ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
            className={`w-1 rounded-sm ${
              bar <= bars
                ? quality === 'excellent'
                  ? 'bg-green-500 dark:bg-green-400'
                  : quality === 'good'
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : quality === 'fair'
                  ? 'bg-yellow-500 dark:bg-yellow-400'
                  : 'bg-red-500 dark:bg-red-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={{
              height: `${bar * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Status Text */}
      <div className="text-sm">
        <div className={`font-semibold ${qualityColor}`}>{qualityLabel}</div>
        {(rtt !== null || bandwidth !== null) && (
          <div className="text-xs text-[#4B5563] dark:text-gray-400 space-x-2">
            {rtt !== null && <span>{rtt}ms</span>}
            {bandwidth !== null && (
              <>
                <span>•</span>
                <span>{formatBandwidth(bandwidth)}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectionStatusBadgeProps {
  quality: ConnectionQuality;
  compact?: boolean;
}

export function ConnectionStatusBadge({
  quality,
  compact = false,
}: ConnectionStatusBadgeProps) {
  const qualityLabel = getQualityLabel(quality);

  const getBgColor = () => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'fair':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'poor':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getBgColor()}`}
    >
      {quality === 'unknown' ? (
        <WifiOff className="h-3 w-3" />
      ) : (
        <Wifi className="h-3 w-3" />
      )}
      {!compact && <span>{qualityLabel} Connection</span>}
    </motion.div>
  );
}
