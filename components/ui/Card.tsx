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
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const glassStyles = glass
    ? 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10'
    : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800';

  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : '';
  const glowStyles = glow ? 'hover:shadow-glow dark:hover:shadow-glow' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(baseStyles, glassStyles, hoverStyles, glowStyles, className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 border-b border-gray-200 dark:border-gray-800', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 border-t border-gray-200 dark:border-gray-800', className)}>{children}</div>;
}
