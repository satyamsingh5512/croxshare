import React, { useEffect, useState } from 'react';

export default function FileHistory() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('nearby:history') || '[]');
      setItems(hist);
    } catch (e) {
      setItems([]);
    }
  }, []);

  if (items.length === 0) {
    return <div className="text-sm text-[#4B5563]">No recent transfers</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-[#E5E7EB]">
          <div>
            <div className="text-sm font-medium text-[#111827]">{it.name || 'file'}</div>
            <div className="text-xs text-[#4B5563]">{it.type} • {Math.round((it.size||0)/1024)} KB</div>
          </div>
          <div>
            {it.type === 'received' ? (
              <a className="rounded-md bg-[#0EA5E9] px-3 py-1 text-xs text-white" href="#">Download</a>
            ) : (
              <span className="text-xs text-[#4B5563]">Sent</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
