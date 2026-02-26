'use client';

import React from 'react';

interface Props {
  label: string;
  percent: number; // 0–100
}

export default function TransferProgress({ label, percent }: Props) {
  if (percent <= 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
