'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        primary: 'bg-primary/10 text-primary dark:text-accent border border-primary/20',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
        gradient: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  pulse = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {pulse && (
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-current"
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  );
}

// Predefined signal strength badges
export function SignalBadge({ strength }: { strength: 'weak' | 'medium' | 'strong' }) {
  const config = {
    weak: { variant: 'danger' as const, label: 'Weak', bars: 1 },
    medium: { variant: 'warning' as const, label: 'Good', bars: 2 },
    strong: { variant: 'success' as const, label: 'Strong', bars: 3 },
  };

  const { variant, label, bars } = config[strength];

  return (
    <Badge variant={variant} size="sm">
      <div className="flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-0.5 rounded-full ${
              i < bars ? 'bg-current' : 'bg-current opacity-30'
            }`}
            style={{ height: `${(i + 1) * 3}px` }}
          />
        ))}
      </div>
      {label}
    </Badge>
  );
}

// Connection status badge
export function StatusBadge({
  status,
}: {
  status: 'online' | 'offline' | 'connecting' | 'idle';
}) {
  const config = {
    online: { variant: 'success' as const, label: 'Online', pulse: true },
    offline: { variant: 'default' as const, label: 'Offline', pulse: false },
    connecting: { variant: 'warning' as const, label: 'Connecting', pulse: true },
    idle: { variant: 'info' as const, label: 'Idle', pulse: false },
  };

  const { variant, label, pulse } = config[status];

  return (
    <Badge variant={variant} pulse={pulse}>
      {label}
    </Badge>
  );
}
