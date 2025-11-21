import React from 'react';

export default function VerificationCard({ peerName, code, onConfirm }: { peerName?: string | null; code?: number | null; onConfirm: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/40 border border-[#E5E7EB]">
      <h4 className="text-lg font-semibold text-[#111827]">Secure connection</h4>
      <p className="text-sm text-[#4B5563] mt-2">Secure connection with <span className="font-semibold text-[#111827]">{peerName}</span></p>
      <div className="mt-4 flex items-center gap-4">
        <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-2xl font-semibold text-[#111827] border border-[#E5E7EB]">{code ?? '—'}</div>
        <div>
          <p className="text-sm text-[#4B5563]">Compare this 4-digit code with your peer.</p>
          <button onClick={onConfirm} className="mt-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA]">Yes, it matches</button>
        </div>
      </div>
    </div>
  );
}
