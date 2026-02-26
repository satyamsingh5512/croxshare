import React, { useState } from 'react';
import { useP2PFileTransfer } from '../../hooks/useP2PFileTransfer';
import VerificationCard from './VerificationCard';
import FileProgress from './FileProgress';

const SIGNALING_URL =
  (typeof window !== 'undefined' && (window as any).__SIGNALING_URL) ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  '/api/signal';

export default function JoinPanel({ initialRoom }: { initialRoom?: string }) {
  const p2p = useP2PFileTransfer(SIGNALING_URL);
  const [room, setRoom] = useState(initialRoom || '');

  async function join() {
    const code = room.replace(/[^0-9]/g, '').slice(0, 6);
    const deviceName = localStorage.getItem('nearby:deviceName') || 'Unnamed Device';
    await p2p.joinRoom(code, deviceName);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-lg border border-[#E5E7EB]">
        <label className="block text-sm text-[#4B5563]">Enter room code</label>
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="123-456" className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3" />
        <div className="mt-3 flex justify-end">
          <button onClick={join} className="rounded-3xl bg-[#4F46E5] px-4 py-2 text-white font-semibold hover:bg-[#4338CA]">Join</button>
        </div>
      </div>

      <div>
        <div className="text-sm text-[#4B5563]">Status: {p2p.connectionState}</div>
      </div>

      {p2p.connectionState !== 'verified' && (
        <VerificationCard peerName={p2p.peerDeviceName} code={p2p.verifyCode ?? null} onConfirm={async () => await p2p.confirmVerification()} />
      )}

      {p2p.receivedFiles.length > 0 && (
        <div className="space-y-3">
          {p2p.receivedFiles.map((f) => (
            <div key={f.id} className="rounded-xl bg-white p-3 shadow-sm border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#111827]">{f.name}</div>
                <div className="text-xs text-[#4B5563]">{Math.round((f.size||0)/1024)} KB</div>
              </div>
              <div>
                <a className="rounded-md bg-[#0EA5E9] px-3 py-1 text-xs text-white" href={URL.createObjectURL(f.blob as Blob)} download={f.name}>Download</a>
              </div>
            </div>
          ))}
        </div>
      )}

      <FileProgress label="Receiving" percent={p2p.receiveProgress} />
    </div>
  );
}
