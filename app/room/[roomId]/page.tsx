'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignaling } from '@/hooks/useSignaling';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import RoomHeader from '@/components/RoomHeader';
import ConnectedDevices from '@/components/ConnectedDevices';
import ConnectionTrace from '@/components/ConnectionTrace';
import FileDropZone from '@/components/FileDropZone';
import FileReceiver from '@/components/FileReceiver';
import TransferList from '@/components/TransferList';
import type { DiscoveredPeer, SignalMessage } from '@/types';
import { normalizeRoomCode } from '@/lib/utils';

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = normalizeRoomCode(params.roomId || '');

  const [myName, setMyName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';
  const connectedPeer = peers.find((p) => p.status === 'connected');

  useEffect(() => {
    const saved = localStorage.getItem('crox:name');
    if (saved) { setMyName(saved); setNameSet(true); }
  }, []);

  function updatePeerStatus(peerId: string, status: DiscoveredPeer['status']) {
    setPeers((prev) => prev.map((p) => p.id === peerId ? { ...p, status } : p));
  }

  const sendSignalRef = useRef<((t: SignalMessage['type'], d: SignalMessage['data'], to?: string) => Promise<void>) | null>(null);
  const wrappedSend = useCallback(
    (t: SignalMessage['type'], d: SignalMessage['data'], to?: string) =>
      sendSignalRef.current?.(t, d, to) ?? Promise.resolve(),
    [],
  );

  const { connectToPeer, handleSignal, sendFile, incomingFiles, removePeer, cleanup } = useFileTransfer({
    sendSignal: wrappedSend,
    onPeerConnected: useCallback((id: string) => updatePeerStatus(id, 'connected'), []),
    onPeerDisconnected: useCallback((id: string) => updatePeerStatus(id, 'disconnected'), []),
  });

  const { sendSignal } = useSignaling({
    roomId: nameSet ? roomId : null,
    myName,
    onPeerJoined: useCallback((id: string, name: string) => {
      setPeers((prev) => prev.some((p) => p.id === id) ? prev : [...prev, { id, name, status: 'discovered' }]);
    }, []),
    onPeerLeft: useCallback((id: string) => {
      setPeers((prev) => prev.filter((p) => p.id !== id));
      removePeer(id);
    }, [removePeer]),
    onSignal: handleSignal,
    onReady: () => {},
  });

  useEffect(() => { sendSignalRef.current = sendSignal; }, [sendSignal]);
  useEffect(() => () => cleanup(), [cleanup]);

  const handleConnect = useCallback((peerId: string) => {
    updatePeerStatus(peerId, 'connecting');
    connectToPeer(peerId).catch(() => updatePeerStatus(peerId, 'discovered'));
  }, [connectToPeer]);

  if (!nameSet) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="mesh-bg pointer-events-none absolute inset-0 h-[520px]" />
        <div className="relative mx-auto max-w-md px-6 py-16">
          <div className="reveal">
            <p className="label">Joining room {roomId}</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--on-surface)]">
              Name this device
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--on-surface-variant)]">
              It&apos;s shown to the other device so you know who&apos;s who.
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
              placeholder="e.g. MacBook Pro"
              autoFocus
              className="input mt-6"
            />
            <button
              onClick={() => {
                if (!myName.trim()) return;
                localStorage.setItem('crox:name', myName.trim());
                setNameSet(true);
              }}
              disabled={!myName.trim()}
              className="btn mt-3 w-full"
            >
              Enter room
            </button>
          </div>
        </div>
      </main>
    );
  }

  const connectedCount = peers.filter((p) => p.status === 'connected').length;
  const activeOrConnectingPeer = peers.find((p) => p.status === 'connected' || p.status === 'connecting');

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mesh-bg pointer-events-none absolute inset-0 h-[420px]" />
      <div className="relative mx-auto max-w-2xl px-6 py-10 space-y-7">
        <div className="reveal" style={{ animationDelay: '0ms' }}>
          <RoomHeader
            roomId={roomId}
            shareUrl={shareUrl}
            peerCount={peers.length}
            connectedCount={connectedCount}
          />
        </div>

        <div className="reveal" style={{ animationDelay: '60ms' }}>
          <ConnectionTrace peer={activeOrConnectingPeer} myName={myName} />
        </div>

        <div className="reveal" style={{ animationDelay: '120ms' }}>
          <ConnectedDevices peers={peers} onConnect={handleConnect} />
        </div>

        <AnimatePresence mode="wait">
          {connectedPeer ? (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <FileDropZone onFiles={(files) => files.forEach((f) => sendFile(f, connectedPeer.id))} />
              <TransferList />
              <FileReceiver files={incomingFiles} />
            </motion.div>
          ) : (
            <p key="waiting" className="reveal text-sm text-[var(--on-surface-variant)]" style={{ animationDelay: '180ms' }}>
              {peers.length === 0
                ? 'Waiting for devices — share the room code above.'
                : 'Tap Connect next to a device to open a direct channel.'}
            </p>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
