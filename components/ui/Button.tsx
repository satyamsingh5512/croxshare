'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type MotionSafeButtonProps = Omit<
  HTMLMotionProps<'button'>,
  'ref' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragTransitionEnd'
>;

interface ButtonProps extends MotionSafeButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onDrag?: HTMLMotionProps<'button'>['onDrag'];
  onDragStart?: HTMLMotionProps<'button'>['onDragStart'];
  onDragEnd?: HTMLMotionProps<'button'>['onDragEnd'];
  onDragTransitionEnd?: HTMLMotionProps<'button'>['onDragTransitionEnd'];
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'group relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white shadow-brand-glow/30 hover:shadow-brand-glow',
    secondary: 'bg-gradient-to-r from-accent to-sky-500 text-white shadow-glow-aqua/40 hover:shadow-brand-glow',
    outline: 'border border-white/20 text-text-dark dark:text-text-dark hover:bg-white/10 hover:text-white',
    ghost: 'text-text-light dark:text-text-dark hover:bg-white/5',
    danger: 'bg-danger text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
      
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms]" />
    </motion.button>
  );
}
