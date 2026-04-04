import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  roomId: string;
}

export default function QRDisplay({ roomId }: QRDisplayProps) {
  const value = `http://${window.location.hostname}:5173/?room=${roomId}`;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
      <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">Scan to join</p>
      <div className="inline-block rounded-lg bg-white p-2">
        <QRCodeSVG value={value} size={160} />
      </div>
      <p className="mt-3 break-all text-xs text-zinc-400">{value}</p>
    </div>
  );
}
