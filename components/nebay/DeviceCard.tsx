'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Laptop, Smartphone, Monitor, WifiOff } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';

interface DeviceCardProps {
  deviceName: string;
  deviceType?: 'laptop' | 'phone' | 'desktop';
  signalStrength: 'weak' | 'medium' | 'strong';
  isConnecting?: boolean;
  isConnected?: boolean;
  onClick?: () => void;
}

const signalConfig = {
  weak: {
    bars: 1,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
  },
  medium: {
    bars: 2,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  strong: {
    bars: 3,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
  },
};

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  desktop: Monitor,
};

export function DeviceCard({
  deviceName,
  deviceType = 'laptop',
  signalStrength,
  isConnecting = false,
  isConnected = false,
  onClick,
}: DeviceCardProps) {
  const signal = signalConfig[signalStrength];
  const DeviceIcon = deviceIcons[deviceType];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card
        glass={isConnected}
        glow={isConnected}
        hover
        className={`cursor-pointer transition-all duration-300 ${
          isConnecting ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-dark-bg' : ''
        }`}
        onClick={onClick}
      >
        <CardBody className="space-y-4">
          {/* Status indicator */}
          {isConnected && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full shadow-glow"
            />
          )}

          {/* Device icon */}
          <div className="flex items-center justify-between">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center ${
                isConnecting ? 'animate-pulse' : ''
              }`}
            >
              <DeviceIcon className="w-8 h-8 text-primary dark:text-accent" />
            </div>

            {/* Signal strength */}
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${signal.bgColor}`}>
              <Wifi className={`w-4 h-4 ${signal.color}`} />
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i < signal.bars ? signal.color.replace('text-', 'bg-') : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    style={{
                      height: `${(i + 1) * 4}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Device name */}
          <div>
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark truncate">
              {deviceName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {deviceType}
            </p>
          </div>

          {/* Connection status */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            {isConnected ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </motion.div>
            ) : isConnecting ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 text-sm text-primary dark:text-accent"
              >
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Connecting...
              </motion.div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Tap to connect
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

interface EmptyDeviceStateProps {
  isSearching?: boolean;
}

export function EmptyDeviceState({ isSearching = false }: EmptyDeviceStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <motion.div
          animate={isSearching ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ${
            isSearching ? '' : 'opacity-50'
          }`}
        >
          {isSearching ? (
            <Wifi className="w-12 h-12 text-primary" />
          ) : (
            <WifiOff className="w-12 h-12 text-gray-400" />
          )}
        </motion.div>
        
        {isSearching && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/30"
          />
        )}
      </div>

      <h3 className="mt-6 text-xl font-semibold text-text-light dark:text-text-dark">
        {isSearching ? 'Searching for devices...' : 'No devices found'}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
        {isSearching
          ? 'Make sure other devices are on the same WiFi network and have Nebay Share open.'
          : 'Start searching to discover nearby devices on your network.'}
      </p>
    </motion.div>
  );
}
