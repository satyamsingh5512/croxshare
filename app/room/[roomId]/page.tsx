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

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      setConfigError(true);
    }
  }, []);

  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 180, margin: 1 }).then(setQrDataUrl).catch(() => {});
  }, [shareUrl]);

  useEffect(() => {
    const saved = localStorage.getItem('crox:name');
    if (saved) {
      setMyName(saved);
      setNameSet(true);
    }
  }, []);

  const onConnected = useCallback(() => {
    setStatus('connected');
    setStatusMessage(null);
  }, []);

  const onDisconnected = useCallback(() => {
    setStatus('disconnected');
    setStatusMessage(null);
  }, []);

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
      const myPeerId = mySocketIdRef.current;
      if (myPeerId && myPeerId < peerId) {
        startAsHost();
      }
    },
    [startAsHost],
  );

  const onPeerLeft = useCallback(() => {
    cleanup();
    setPeerName(null);
    setStatus('waiting');
    setStatusMessage(null);
  }, [cleanup]);

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

  useEffect(() => {
    sendSignalRef.current = sendSignal;
  }, [sendSignal]);

  useEffect(() => () => cleanup(), [cleanup]);

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-[2rem] border border-rose-200 bg-rose-50/90 p-6 text-center shadow-xl">
          <p className="font-semibold text-rose-800">Pusher not configured</p>
          <p className="mt-2 text-sm leading-6 text-rose-700">
            Set <code className="rounded bg-rose-100 px-1">NEXT_PUBLIC_PUSHER_KEY</code> and{' '}
            <code className="rounded bg-rose-100 px-1">NEXT_PUBLIC_PUSHER_CLUSTER</code> in your environment.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-rose-700 underline">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!nameSet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[2rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.86)] p-7 shadow-[0_24px_70px_rgba(92,58,30,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Before joining</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">What&apos;s your device called?</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This label is shown to the other person so they know which device is requesting the transfer.
          </p>
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
            className="mt-6 w-full rounded-[1.2rem] border border-[rgba(102,72,37,0.15)] bg-white/80 px-4 py-4 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[rgba(184,92,56,0.14)]"
          />
          <button
            onClick={() => {
              if (!myName.trim()) return;
              localStorage.setItem('crox:name', myName.trim());
              setNameSet(true);
            }}
            disabled={!myName.trim()}
            className="mt-4 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] py-4 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(143,62,34,0.28)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <main className="mx-auto max-w-5xl space-y-5 py-4">
        <RoomHeader roomId={roomId} shareUrl={shareUrl} status={status} peerName={peerName} qrDataUrl={qrDataUrl} />

        {status === 'connected' ? (
          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <FileDropZone onFiles={(files) => files.forEach((f) => sendFile(f))} />
              <TransferList />
            </div>
            <FileReceiver files={incomingFiles} />
          </section>
        ) : (
          <div className="rounded-[1.8rem] border border-[rgba(102,72,37,0.12)] bg-[rgba(255,252,247,0.86)] p-8 text-center shadow-[0_22px_60px_rgba(92,58,30,0.1)] backdrop-blur">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(184,92,56,0.1)] text-[var(--accent)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
                <path d="M12 3v6m0 12v-4m9-5h-4M7 12H3m15.364 6.364-2.828-2.828M8.464 8.464 5.636 5.636m12.728 0-2.828 2.828M8.464 15.536l-2.828 2.828" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Room status</p>
            <div className="mt-3 text-base leading-7 text-[var(--muted)]">
              {status === 'waiting' && 'Share the code or link above. File transfer starts once the other device joins.'}
              {status === 'connecting' && 'Establishing secure connection...'}
              {status === 'disconnected' && 'The other device disconnected. Ask them to rejoin.'}
              {status === 'error' && (statusMessage || 'Connection failed. Try refreshing the page.')}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
