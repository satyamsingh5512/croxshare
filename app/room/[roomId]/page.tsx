'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useSignaling } from '@/hooks/useSignaling';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import FileDropZone from '@/components/FileDropZone';
import FileReceiver from '@/components/FileReceiver';
import TransferList from '@/components/TransferList';
import RoomHeader from '@/components/RoomHeader';
import ConnectedDevices from '@/components/ConnectedDevices';
import type { DiscoveredPeer, SignalMessage } from '@/types';
import { normalizeRoomCode } from '@/lib/utils';

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = normalizeRoomCode(params.roomId || '');

  const [myName, setMyName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [configError, setConfigError] = useState(false);
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);
  const myIdRef = useRef<string>('');

  // Derived: overall status from peers list
  const hasConnected = peers.some((p) => p.status === 'connected');
  const status = hasConnected ? 'connected' : peers.length > 0 ? 'connecting' : 'waiting';

  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const shareOrigin = configuredOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareUrl = shareOrigin ? `${shareOrigin}/room/${roomId}` : '';

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
    if (saved) { setMyName(saved); setNameSet(true); }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !roomId) return;
    const canonical = `/room/${roomId}`;
    if (window.location.pathname !== canonical) window.history.replaceState(null, '', canonical);
  }, [roomId]);

  function updatePeerStatus(peerId: string, status: DiscoveredPeer['status']) {
    setPeers((prev) => prev.map((p) => p.id === peerId ? { ...p, status } : p));
  }

  const onPeerConnected = useCallback((peerId: string) => {
    updatePeerStatus(peerId, 'connected');
  }, []);

  const onPeerDisconnected = useCallback((peerId: string) => {
    updatePeerStatus(peerId, 'disconnected');
  }, []);

  // sendSignal ref trick so useFileTransfer doesn't need to re-create on every render
  const sendSignalRef = useRef<((t: SignalMessage['type'], d: SignalMessage['data'], to?: string) => Promise<void>) | null>(null);
  const wrappedSend = useCallback(
    (t: SignalMessage['type'], d: SignalMessage['data'], to?: string) => sendSignalRef.current?.(t, d, to) ?? Promise.resolve(),
    [],
  );

  const { connectToPeer, handleSignal, sendFile, incomingFiles, removePeer, cleanup } =
    useFileTransfer({ sendSignal: wrappedSend, onPeerConnected, onPeerDisconnected });

  const onPeerJoined = useCallback((peerId: string, peerName: string) => {
    setPeers((prev) => {
      if (prev.some((p) => p.id === peerId)) return prev;
      return [...prev, { id: peerId, name: peerName, status: 'discovered' }];
    });
  }, []);

  const onPeerLeft = useCallback((peerId: string) => {
    setPeers((prev) => prev.filter((p) => p.id !== peerId));
    removePeer(peerId);
  }, [removePeer]);

  const { sendSignal, myId } = useSignaling({
    roomId: nameSet ? roomId : null,
    myName,
    onPeerJoined,
    onPeerLeft,
    onSignal: handleSignal,
    onReady: (id) => { myIdRef.current = id; },
    onError: (msg) => console.error('[signaling error]', msg),
  });

  useEffect(() => { sendSignalRef.current = sendSignal; }, [sendSignal]);
  useEffect(() => () => cleanup(), [cleanup]);

  const handleConnect = useCallback((peerId: string) => {
    updatePeerStatus(peerId, 'connecting');
    connectToPeer(peerId).catch(() => updatePeerStatus(peerId, 'discovered'));
  }, [connectToPeer]);

  // First connected peer (for file sending target)
  const connectedPeer = peers.find((p) => p.status === 'connected');

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-[2rem] border border-rose-200 bg-rose-50/90 p-6 text-center shadow-2xl shadow-rose-500/10 backdrop-blur-md">
          <p className="font-semibold text-rose-800">Pusher not configured</p>
          <p className="mt-2 text-sm leading-6 text-rose-700">
            Set <code className="rounded bg-rose-100 px-1 font-mono text-xs">NEXT_PUBLIC_PUSHER_KEY</code> and{' '}
            <code className="rounded bg-rose-100 px-1 font-mono text-xs">NEXT_PUBLIC_PUSHER_CLUSTER</code> in your environment.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-rose-700 underline transition hover:text-rose-900">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!nameSet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white/80 p-7 shadow-2xl shadow-slate-300/30 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Before joining</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">What&apos;s your device called?</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            This label is shown to the other person so they know which device is connecting.
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
            className="mt-6 w-full rounded-[1.2rem] border border-[var(--line)] bg-white/90 px-4 py-4 text-sm font-medium text-[var(--text)] placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
          <button
            onClick={() => {
              if (!myName.trim()) return;
              localStorage.setItem('crox:name', myName.trim());
              setNameSet(true);
            }}
            disabled={!myName.trim()}
            className="mt-4 w-full rounded-[1.2rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <main className="mx-auto max-w-5xl space-y-6 py-4">
        <RoomHeader
          roomId={roomId}
          shareUrl={shareUrl}
          status={status}
          peerName={connectedPeer?.name ?? null}
          qrDataUrl={qrDataUrl}
        />

        {/* Peer discovery panel — always visible once in room */}
        <ConnectedDevices peers={peers} onConnect={handleConnect} />

        {hasConnected ? (
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <FileDropZone onFiles={(files) => files.forEach((f) => sendFile(f, connectedPeer?.id))} />
              <TransferList />
            </div>
            <FileReceiver files={incomingFiles} />
          </section>
        ) : (
          <div className="rounded-[1.8rem] border border-[var(--line)] bg-white/70 p-8 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
                <path d="M12 3v6m0 12v-4m9-5h-4M7 12H3m15.364 6.364-2.828-2.828M8.464 8.464 5.636 5.636m12.728 0-2.828 2.828M8.464 15.536l-2.828 2.828" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Room status</p>
            <div className="mt-3 text-base leading-relaxed text-[var(--text)] font-medium">
              {peers.length === 0
                ? 'Share the code or link above. Devices that join will appear above — click Connect to start.'
                : 'Click Connect next to a device to establish a WebRTC connection.'}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
