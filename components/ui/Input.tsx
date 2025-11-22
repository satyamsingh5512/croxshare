'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200',
            'bg-white dark:bg-dark-surface',
            'border-gray-200 dark:border-gray-700',
            'text-text-light dark:text-text-dark',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'focus:shadow-glow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-12',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}

export function PinInput({ length = 4, onComplete }: { length?: number; onComplete: (pin: string) => void }) {
  const [pins, setPins] = React.useState<string[]>(Array(length).fill(''));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPins = [...pins];
    newPins[index] = value.slice(-1);
    setPins(newPins);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPins.every(pin => pin !== '')) {
      onComplete(newPins.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={el => { if (el) inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          className={cn(
            'w-14 h-16 text-center text-2xl font-bold rounded-2xl',
            'bg-white dark:bg-dark-surface',
            'border-2 border-gray-200 dark:border-gray-700',
            'text-text-light dark:text-text-dark',
            'focus:border-primary focus:ring-4 focus:ring-primary/20',
            'focus:shadow-glow transition-all duration-200',
            'outline-none'
          )}
        />
      ))}
    </div>
  );
}
