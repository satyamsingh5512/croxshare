'use client';

import React from 'react';

interface Props { label: string; percent: number; }

export default function TransferProgress({ label, percent }: Props) {
  if (percent <= 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.16em]">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="text-[var(--accent)]">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
