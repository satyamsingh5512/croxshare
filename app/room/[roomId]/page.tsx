'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useSignaling } from '@/hooks/useSignaling';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import PeerStatusBadge from '@/components/PeerStatus';
import FileDropZone from '@/components/FileDropZone';
import FileReceiver from '@/components/FileReceiver';
import TransferProgress from '@/components/TransferProgress';
import type { PeerStatus, SignalMessage } from '@/types';

function formatCode(code: string) {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const [myName, setMyName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [status, setStatus] = useState<PeerStatus>('waiting');
  const [peerName, setPeerName] = useState<string | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [configError, setConfigError] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

  // Check Pusher config on mount
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      setConfigError(true);
    }
  }, []);

  // Generate QR code
  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 180, margin: 1 }).then(setQrDataUrl).catch(() => {});
  }, [shareUrl]);

  // Load saved name
  useEffect(() => {
    const saved = localStorage.getItem('crox:name');
    if (saved) { setMyName(saved); setNameSet(true); }
  }, []);

  const onConnected = useCallback(() => setStatus('connected'), []);
  const onDisconnected = useCallback(() => setStatus('disconnected'), []);

  const { startAsHost, handleSignal, sendFile, sendProgress, incomingFiles, cleanup } =
    useFileTransfer({ sendSignal: async () => {}, onConnected, onDisconnected });

  // We need sendSignal from useSignaling, but useFileTransfer also needs it.
  // Solve with a ref-based forwarder:
  const sendSignalRef = React.useRef<((t: SignalMessage['type'], d: SignalMessage['data']) => Promise<void>) | null>(null);

  const wrappedSendSignal = useCallback(
    async (t: SignalMessage['type'], d: SignalMessage['data']) => {
      await sendSignalRef.current?.(t, d);
    },
    [],
  );

  const { startAsHost: startHostWithSignal, handleSignal: handleSignalWithSignal, sendFile: sendFileWithSignal, cleanup: cleanupWithSignal } =
    useFileTransfer({ sendSignal: wrappedSendSignal, onConnected, onDisconnected });

  const onPeerJoined = useCallback(
    (peerId: string, name: string) => {
      setPeerName(name);
      setStatus('connecting');
      // Whoever has a lower socket ID becomes host (creates offer)
      if (mySocketId && mySocketId < peerId) {
        startHostWithSignal();
      }
    },
    [mySocketId, startHostWithSignal],
  );

  const onPeerLeft = useCallback(() => {
    setPeerName(null);
    setStatus('waiting');
  }, []);

  const { sendSignal } = useSignaling({
    roomId: nameSet ? roomId : null,
    myName,
    onPeerJoined,
    onPeerLeft,
    onSignal: handleSignalWithSignal,
    onSocketId: setMySocketId,
  });

  // Wire sendSignal ref so the file transfer hook can use it
  useEffect(() => {
    sendSignalRef.current = sendSignal;
  }, [sendSignal]);

  useEffect(() => () => cleanupWithSignal(), [cleanupWithSignal]);

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">Pusher not configured</p>
          <p className="mt-2 text-sm text-red-700">
            Set <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_PUSHER_KEY</code> and{' '}
            <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_PUSHER_CLUSTER</code> environment
            variables in Vercel dashboard or <code className="rounded bg-red-100 px-1">.env.local</code>.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-indigo-600 underline">← Home</Link>
        </div>
      </div>
    );
  }

  // Name entry screen
  if (!nameSet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">What's your device called?</h1>
          <p className="mt-1 text-sm text-gray-500">Shown to the other person so they know who's connecting.</p>
          <input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && myName.trim()) {
                localStorage.setItem('crox:name', myName.trim());
                setNameSet(true);
              }
            }}
            placeholder="e.g. Satyam's Laptop"
            autoFocus
            className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              if (!myName.trim()) return;
              localStorage.setItem('crox:name', myName.trim());
              setNameSet(true);
            }}
            disabled={!myName.trim()}
            className="mt-3 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-white">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Croxshare</span>
          </Link>
          <PeerStatusBadge status={status} peerName={peerName} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        {/* Room info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Room</p>
          <p className="mt-1 text-3xl font-bold tracking-widest text-gray-900">{formatCode(roomId)}</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="flex-1 truncate text-xs text-gray-500">{shareUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
              >Copy</button>
            </div>
          </div>

          {qrDataUrl && (
            <div className="mt-4 flex flex-col items-center">
              <p className="mb-2 text-xs text-gray-400">Or scan to join on another device</p>
              <img src={qrDataUrl} alt="QR code" className="h-44 w-44 rounded-xl border border-gray-100" />
            </div>
          )}
        </div>

        {/* Transfer area */}
        {status === 'connected' ? (
          <>
            <FileDropZone
              onFiles={(files) => files.forEach((f) => sendFileWithSignal(f))}
            />
            <TransferProgress label="Sending" percent={sendProgress} />
            <FileReceiver files={incomingFiles} />
          </>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            {status === 'waiting' && 'Share the code or link above. File transfer starts once the other device joins.'}
            {status === 'connecting' && 'Establishing secure connection…'}
            {status === 'disconnected' && 'The other device disconnected. Ask them to rejoin.'}
            {status === 'error' && 'Connection failed. Try refreshing the page.'}
          </div>
        )}
      </main>
    </div>
  );
}
