'use client';

import React from 'react';

interface Props {
  label: string;
  percent: number;
}

export default function TransferProgress({ label, percent }: Props) {
  if (percent <= 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        <span>{label}</span>
        <span className="text-[var(--accent-deep)]">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--teal)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
