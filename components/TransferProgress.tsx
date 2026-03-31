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
      <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(102,72,37,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--teal))] transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
