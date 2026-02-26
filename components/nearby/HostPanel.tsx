import React, { useEffect, useState } from 'react';
import { useP2PFileTransfer } from '../../hooks/useP2PFileTransfer';
import DeviceNameModal from './DeviceNameModal';
import VerificationCard from './VerificationCard';
import FileDropzone from './FileDropzone';
import FileProgress from './FileProgress';
import QRCodeDisplay from './QRCodeDisplay';

const SIGNALING_URL =
  (typeof window !== 'undefined' && (window as any).__SIGNALING_URL) ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  '/api/signal';

function formatRoom(code: string) {
  return code.replace(/(\d{3})(\d{3})/, '$1-$2');
}

export default function HostPanel() {
  const p2p = useP2PFileTransfer(SIGNALING_URL);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('nearby:deviceName');
    if (!name) setShowNameModal(true);
  }, []);

  async function create() {
    // generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setRoomCode(code);
    const deviceName = localStorage.getItem('nearby:deviceName') || 'Unnamed Device';
    await p2p.createRoom(code, deviceName);
  }

  return (
    <div className="space-y-6">
      <DeviceNameModal onClose={() => setShowNameModal(false)} />

      {!roomCode ? (
        <div className="flex gap-3">
          <button onClick={create} className="rounded-3xl bg-[#4F46E5] px-6 py-3 text-white font-semibold hover:bg-[#4338CA]">Create Sharing Session</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-4 shadow-lg border border-[#E5E7EB]">
            <div className="text-sm text-[#4B5563]">Room Code</div>
            <div className="mt-2 text-2xl font-semibold text-[#111827]">{formatRoom(roomCode)}</div>
            <div className="mt-3 flex items-center gap-3">
              <a className="text-sm text-[#0EA5E9]" href={`/?room=${roomCode}`}>Open link</a>
              <button
                onClick={() => navigator.clipboard.writeText(`${location.origin}/?room=${roomCode}`)}
                className="ml-auto rounded-md bg-[#F9FAFB] px-3 py-2 text-sm border border-[#E5E7EB]"
              >
                Copy Link
              </button>
            </div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Share this link or QR code with the receiving device</div>
            <div className="mt-3 text-sm text-[#4B5563]">Status: {p2p.connectionState === 'connecting' ? 'Waiting for connection…' : p2p.connectionState}</div>
          </div>

          {/* QR Code */}
          <QRCodeDisplay url={`${typeof window !== 'undefined' ? window.location.origin : ''}/?room=${roomCode}`} />

          {p2p.connectionState !== 'verified' && (
            <VerificationCard peerName={p2p.peerDeviceName} code={p2p.verifyCode ?? null} onConfirm={async () => { await p2p.confirmVerification(); }} />
          )}

          {p2p.connectionState === 'verified' && (
            <div className="space-y-4">
              <FileDropzone onFile={async (f) => await p2p.sendFile(f)} />
              <FileProgress label="Sending" percent={p2p.sendProgress} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
