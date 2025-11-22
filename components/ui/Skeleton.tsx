'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular';
  shimmer?: boolean;
}

export function Skeleton({
  className,
  variant = 'default',
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gray-200 dark:bg-gray-800',
        {
          'rounded-2xl': variant === 'default',
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rectangular',
        },
        className
      )}
      {...props}
    >
      {shimmer && (
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
        />
      )}
    </div>
  );
}

// Predefined skeleton layouts
export function DeviceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" className="w-16 h-16" />
        <Skeleton className="w-20 h-6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <Skeleton className="w-full h-8" />
    </div>
  );
}

export function FileCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-4 flex items-center gap-4">
      <Skeleton variant="rectangular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-2/3 h-4" />
        <Skeleton className="w-1/3 h-3" />
      </div>
      <Skeleton variant="circular" className="w-8 h-8" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <Skeleton className="w-1/2 h-6" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-4/6 h-4" />
      </div>
    </div>
  );
}

export function AvatarSkeleton() {
  return <Skeleton variant="circular" className="w-12 h-12" />;
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
