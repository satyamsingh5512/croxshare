import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 }, (err) => {
      if (err) console.error('QR generation error', err);
    });
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 shadow-lg border border-[#E5E7EB]">
      <p className="text-sm text-[#4B5563]">Scan to join</p>
      <canvas ref={canvasRef} className="rounded-xl" />
    </div>
  );
}
