import React from 'react';

export default function FileProgress({ label, percent }: { label?: string; percent: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#4B5563]">{label}</span>
        <span className="text-sm font-medium text-[#111827]">{percent}%</span>
      </div>
      <div className="mt-2 h-3 w-full rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
        <div className="h-3 rounded-xl bg-[#4F46E5] transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
