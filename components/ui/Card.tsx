'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, glow = false, glass = false, onClick }: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-500 shadow-lg shadow-black/20';
  
  const glassStyles = glass
    ? 'glass-panel dark:glass-panel-dark'
    : 'bg-white/90 dark:bg-dark-card/90 border border-white/10 dark:border-white/5 backdrop-blur-md';

  const hoverStyles = hover ? 'cursor-pointer' : 'cursor-default';
  const glowStyles = glow ? 'hover:shadow-brand-glow' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      whileHover={hover ? { scale: 1.05 } : undefined}
      whileTap={hover ? { scale: 0.95 } : undefined}
      className={cn(baseStyles, glassStyles, hoverStyles, glowStyles, className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 border-b border-white/10 dark:border-white/5', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 border-t border-white/10 dark:border-white/5', className)}>{children}</div>;
}
