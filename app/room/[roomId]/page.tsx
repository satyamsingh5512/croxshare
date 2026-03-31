'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useSignaling } from '@/hooks/useSignaling';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import FileDropZone from '@/components/FileDropZone';
import FileReceiver from '@/components/FileReceiver';
import TransferList from '@/components/TransferList';
import RoomHeader from '@/components/RoomHeader';
import type { PeerStatus, SignalMessage } from '@/types';

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const [myName, setMyName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [status, setStatus] = useState<PeerStatus>('waiting');
  const [peerName, setPeerName] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [configError, setConfigError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const mySocketIdRef = React.useRef<string | null>(null);

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

  const onConnected = useCallback(() => {
    setStatus('connected');
    setStatusMessage(null);
  }, []);
  const onDisconnected = useCallback(() => {
    setStatus('disconnected');
    setStatusMessage(null);
  }, []);

  // We need sendSignal from useSignaling, but useFileTransfer also needs it.
  // Solve with a ref-based forwarder:
  const sendSignalRef = React.useRef<((t: SignalMessage['type'], d: SignalMessage['data']) => Promise<void>) | null>(null);

  const wrappedSendSignal = useCallback(
    async (t: SignalMessage['type'], d: SignalMessage['data']) => {
      await sendSignalRef.current?.(t, d);
    },
    [],
  );

  const { startAsHost, handleSignal, sendFile, incomingFiles, cleanup } =
    useFileTransfer({ sendSignal: wrappedSendSignal, onConnected, onDisconnected });

  const onPeerJoined = useCallback(
    (peerId: string, name: string) => {
      setPeerName(name);
      setStatus('connecting');
      setStatusMessage(null);
      // Whoever has a lower peer ID becomes host and creates the offer.
      const myPeerId = mySocketIdRef.current;
      if (myPeerId && myPeerId < peerId) {
        startAsHost();
      }
    },
    [startAsHost],
  );

  const onPeerLeft = useCallback(() => {
    setPeerName(null);
    setStatus('waiting');
    setStatusMessage(null);
  }, []);

  const { sendSignal } = useSignaling({
    roomId: nameSet ? roomId : null,
    myName,
    onPeerJoined,
    onPeerLeft,
    onSignal: handleSignal,
    onSocketId: (id) => {
      mySocketIdRef.current = id;
    },
    onError: (message) => {
      setStatus('error');
      setStatusMessage(message);
    },
  });

  // Wire sendSignal ref so the file transfer hook can use it
  useEffect(() => {
    sendSignalRef.current = sendSignal;
  }, [sendSignal]);

  useEffect(() => () => cleanup(), [cleanup]);

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
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <RoomHeader roomId={roomId} shareUrl={shareUrl} status={status} peerName={peerName} qrDataUrl={qrDataUrl} />

        {/* Transfer area */}
        {status === 'connected' ? (
          <>
            <FileDropZone
              onFiles={(files) => files.forEach((f) => sendFile(f))}
            />
            <TransferList />
            <FileReceiver files={incomingFiles} />
          </>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            {status === 'waiting' && 'Share the code or link above. File transfer starts once the other device joins.'}
            {status === 'connecting' && 'Establishing secure connection…'}
            {status === 'disconnected' && 'The other device disconnected. Ask them to rejoin.'}
            {status === 'error' && (statusMessage || 'Connection failed. Try refreshing the page.')}
          </div>
        )}
      </main>
    </div>
  );
}
