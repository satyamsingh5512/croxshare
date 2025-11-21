import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'nearby:deviceName';

export default function DeviceNameModal({ onClose }: { onClose?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) setVisible(true);
    else setName(existing);
  }, []);

  function save() {
    const n = name.trim() || `Device-${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem(STORAGE_KEY, n);
    setVisible(false);
    onClose?.();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-11/12 max-w-md rounded-3xl bg-white p-6 shadow-lg shadow-slate-300/40 border border-[#E5E7EB]">
        <h3 className="text-xl font-semibold text-[#111827]">Name this device</h3>
        <p className="text-sm text-[#4B5563] mt-2">This helps identify your device to others nearby.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John's iPhone"
          className="mt-4 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#111827]"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
            className="rounded-xl px-4 py-2 text-sm font-medium text-[#4B5563]"
          >
            Skip
          </button>
          <button onClick={save} className="rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA]">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
