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
        <div className="max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 p-7 text-center">
          <p className="font-semibold text-rose-300">Pusher not configured</p>
          <p className="mt-2 text-sm leading-6 text-rose-400/80">
            Set <code className="rounded bg-rose-500/20 px-1 font-mono text-xs">NEXT_PUBLIC_PUSHER_KEY</code> and{' '}
            <code className="rounded bg-rose-500/20 px-1 font-mono text-xs">NEXT_PUBLIC_PUSHER_CLUSTER</code> in your environment.
          </p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-rose-400 underline hover:text-rose-300">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!nameSet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-7">
          <p className="label-cap">Before joining</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">What&apos;s your device called?</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Shown to the other person so they know which device is connecting.
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
            className="mt-6 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-4 py-3.5 text-sm font-medium text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--line-focus)] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            onClick={() => {
              if (!myName.trim()) return;
              localStorage.setItem('crox:name', myName.trim());
              setNameSet(true);
            }}
            disabled={!myName.trim()}
            className="btn-primary mt-4 w-full py-3.5"
          >
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-800/15 blur-[100px]" />
      <main className="relative mx-auto max-w-5xl space-y-5 py-4">
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
          <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <FileDropZone onFiles={(files) => files.forEach((f) => sendFile(f, connectedPeer?.id))} />
              <TransferList />
            </div>
            <FileReceiver files={incomingFiles} />
          </section>
        ) : (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] text-[var(--accent)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <path d="M12 3v6m0 12v-4m9-5h-4M7 12H3m15.364 6.364-2.828-2.828M8.464 8.464 5.636 5.636m12.728 0-2.828 2.828M8.464 15.536l-2.828 2.828" />
              </svg>
            </div>
            <p className="label-cap">Waiting</p>
            <p className="mt-3 text-base font-medium text-[var(--text-2)]">
              {peers.length === 0
                ? 'Share the room code — devices that join will appear above.'
                : 'Click Connect next to a device to open a direct WebRTC channel.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
