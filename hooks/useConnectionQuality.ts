/**
 * Connection Quality Monitor Hook
 * - Measures RTT (Round Trip Time) via ping/pong
 * - Estimates bandwidth during transfers
 * - Provides quality indicators (excellent/good/poor)
 */

import { useEffect, useRef, useState } from 'react';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

interface QualityMetrics {
  quality: ConnectionQuality;
  rtt: number | null; // milliseconds
  bandwidth: number | null; // bytes per second
  packetLoss: number; // percentage
}

export function useConnectionQuality(dataChannel: RTCDataChannel | null) {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    quality: 'unknown',
    rtt: null,
    bandwidth: null,
    packetLoss: 0,
  });

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(0);
  const transferStartRef = useRef<number>(0);
  const bytesTransferredRef = useRef<number>(0);

  // Measure RTT using ping/pong
  useEffect(() => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      setMetrics((prev) => ({ ...prev, quality: 'unknown', rtt: null }));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'pong') {
            const rtt = Date.now() - lastPingTimeRef.current;
            updateMetricsWithRTT(rtt);
          }
        } catch (e) {
          // Not a control message, ignore
        }
      }
    };

    dataChannel.addEventListener('message', handleMessage);

    // Send ping every 2 seconds
    pingIntervalRef.current = setInterval(() => {
      if (dataChannel.readyState === 'open') {
        lastPingTimeRef.current = Date.now();
        try {
          dataChannel.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.warn('Failed to send ping:', e);
        }
      }
    }, 2000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      dataChannel.removeEventListener('message', handleMessage);
    };
  }, [dataChannel]);

  const updateMetricsWithRTT = (rtt: number) => {
    let quality: ConnectionQuality;
    
    if (rtt < 50) {
      quality = 'excellent';
    } else if (rtt < 150) {
      quality = 'good';
    } else if (rtt < 300) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    setMetrics((prev) => ({ ...prev, rtt, quality }));
  };

  // Track transfer bandwidth
  const updateBandwidth = (bytes: number, duration: number) => {
    if (duration > 0) {
      const bandwidth = bytes / (duration / 1000); // bytes per second
      setMetrics((prev) => ({ ...prev, bandwidth }));
    }
  };

  const startTransfer = () => {
    transferStartRef.current = Date.now();
    bytesTransferredRef.current = 0;
  };

  const trackBytes = (bytes: number) => {
    bytesTransferredRef.current += bytes;
    const duration = Date.now() - transferStartRef.current;
    if (duration > 1000) {
      // Update every second
      updateBandwidth(bytesTransferredRef.current, duration);
    }
  };

  const endTransfer = () => {
    const duration = Date.now() - transferStartRef.current;
    updateBandwidth(bytesTransferredRef.current, duration);
  };

  return {
    metrics,
    startTransfer,
    trackBytes,
    endTransfer,
  };
}

export function formatBandwidth(bytesPerSecond: number | null): string {
  if (bytesPerSecond === null) return 'Unknown';
  
  const mbps = bytesPerSecond / (1024 * 1024);
  if (mbps >= 1) {
    return `${mbps.toFixed(1)} MB/s`;
  }
  
  const kbps = bytesPerSecond / 1024;
  return `${kbps.toFixed(0)} KB/s`;
}

export function getQualityColor(quality: ConnectionQuality): string {
  switch (quality) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400';
    case 'good':
      return 'text-blue-600 dark:text-blue-400';
    case 'fair':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'poor':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

export function getQualityLabel(quality: ConnectionQuality): string {
  switch (quality) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default:
      return 'Checking...';
  }
}
