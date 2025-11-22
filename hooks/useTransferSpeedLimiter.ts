/**
 * Transfer Speed Limiter Hook
 * - Configurable bandwidth throttling
 * - Smooth rate limiting using token bucket algorithm
 * - Real-time speed adjustment
 */

import { useCallback, useRef, useState } from 'react';

export type SpeedLimit = 'unlimited' | '1mb' | '5mb' | '10mb' | '20mb';

interface SpeedLimitConfig {
  value: SpeedLimit;
  bytesPerSecond: number | null;
  label: string;
}

export const SPEED_LIMITS: Record<SpeedLimit, SpeedLimitConfig> = {
  unlimited: {
    value: 'unlimited',
    bytesPerSecond: null,
    label: 'Unlimited',
  },
  '1mb': {
    value: '1mb',
    bytesPerSecond: 1024 * 1024,
    label: '1 MB/s',
  },
  '5mb': {
    value: '5mb',
    bytesPerSecond: 5 * 1024 * 1024,
    label: '5 MB/s',
  },
  '10mb': {
    value: '10mb',
    bytesPerSecond: 10 * 1024 * 1024,
    label: '10 MB/s',
  },
  '20mb': {
    value: '20mb',
    bytesPerSecond: 20 * 1024 * 1024,
    label: '20 MB/s',
  },
};

export function useTransferSpeedLimiter(initialLimit: SpeedLimit = 'unlimited') {
  const [speedLimit, setSpeedLimit] = useState<SpeedLimit>(initialLimit);
  const tokensRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  /**
   * Token bucket algorithm for rate limiting
   * - Tokens represent bytes that can be sent
   * - Tokens refill at the configured rate
   */
  const throttle = useCallback(
    async (chunkSize: number): Promise<void> => {
      const config = SPEED_LIMITS[speedLimit];
      if (!config.bytesPerSecond) {
        // Unlimited - no throttling
        return;
      }

      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000; // seconds

      // Refill tokens based on elapsed time
      tokensRef.current = Math.min(
        config.bytesPerSecond,
        tokensRef.current + elapsed * config.bytesPerSecond
      );
      lastUpdateRef.current = now;

      // If we don't have enough tokens, wait
      if (tokensRef.current < chunkSize) {
        const deficit = chunkSize - tokensRef.current;
        const waitTime = (deficit / config.bytesPerSecond) * 1000; // milliseconds
        
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        
        // Update tokens after waiting
        tokensRef.current = chunkSize;
      }

      // Consume tokens
      tokensRef.current -= chunkSize;
    },
    [speedLimit]
  );

  const setLimit = useCallback((limit: SpeedLimit) => {
    setSpeedLimit(limit);
    // Reset tokens when changing limit
    tokensRef.current = 0;
    lastUpdateRef.current = Date.now();
  }, []);

  const getCurrentConfig = useCallback(() => {
    return SPEED_LIMITS[speedLimit];
  }, [speedLimit]);

  return {
    speedLimit,
    setLimit,
    throttle,
    getCurrentConfig,
    limits: SPEED_LIMITS,
  };
}
